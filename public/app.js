const $ = (selector) => document.querySelector(selector);
const state = { patients: [], appointments: [], catalogs: { patients: [], medicos: [] }, editing: null, modalType: null };
const fmtDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" });
};
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
async function api(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No se pudo completar la operación.");
  return data;
}
function toast(message) {
  $("#toast").textContent = message; $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 2600);
}
function showView(view) {
  document.querySelectorAll(".view").forEach(el => el.classList.add("hidden"));
  $(`#${view}-view`).classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === view));
  $("#page-title").textContent = ({ dashboard:"Resumen general", patients:"Gestión de pacientes", appointments:"Gestión de citas médicas" })[view];
  if (view === "patients") renderPatients();
  if (view === "appointments") renderAppointments();
}
async function loadAll() {
  try {
    [state.patients, state.appointments, state.catalogs] = await Promise.all([
      api("/api/pacientes"), api("/api/citas"), api("/api/citas/catalogos")
    ]);
    console.log("Pacientes recibidos:", state.patients);

    renderDashboard(); renderPatients(); renderAppointments();
  } catch (e) { toast(e.message); }
}
function renderDashboard() {
  $("#stat-patients").textContent = state.patients.length;
  $("#stat-appointments").textContent = state.appointments.length;
  $("#stat-pending").textContent = state.appointments.filter(a => a.estado === "Pendiente").length;
  $("#stat-confirmed").textContent = state.appointments.filter(a => a.estado === "Confirmada").length;
  const rows = [...state.appointments].sort((a,b) => new Date(b.fecha_hora)-new Date(a.fecha_hora)).slice(0,5);
  $("#recent-table").innerHTML = rows.length ? rows.map(a => `<tr><td>${esc(a.paciente)}</td><td>${esc(a.medico)}</td><td>${esc(fmtDate(a.fecha_hora))}</td><td>${statusTag(a.estado)}</td></tr>`).join("") : emptyRow(4, "Todavía no hay citas registradas.");
}
function statusTag(status) { return `<span class="status ${esc(status)}">${esc(status)}</span>`; }
function emptyRow(cols, message) { return `<tr><td colspan="${cols}" class="empty">${esc(message)}</td></tr>`; }
function renderPatients() {
  const query = ($("#patient-search")?.value || "").toLowerCase();
  const rows = state.patients.filter(p => `${p.nombre} ${p.documento} ${p.correo || ""}`.toLowerCase().includes(query));
  $("#patient-count").textContent = `${rows.length} paciente(s)`;
  $("#patients-table").innerHTML = rows.length ? rows.map(p => `<tr>
    <td>${esc(p.nombre)}</td><td>${esc(p.documento)}</td><td>${esc(p.telefono || "—")}</td><td>${esc(p.correo || "—")}</td>
    <td><div class="actions"><button class="action-btn" data-edit-patient="${p.id_paciente}">Editar</button><button class="action-btn danger" data-delete-patient="${p.id_paciente}">Eliminar</button></div></td>
  </tr>`).join("") : emptyRow(5, "No hay pacientes que mostrar.");
}
function renderAppointments() {
  const query = ($("#appointment-search")?.value || "").toLowerCase();
  const status = $("#status-filter")?.value || "";
  const rows = state.appointments.filter(a => `${a.paciente} ${a.medico} ${a.motivo}`.toLowerCase().includes(query) && (!status || a.estado === status));
  $("#appointments-table").innerHTML = rows.length ? rows.map(a => `<tr>
    <td>${esc(a.paciente)}</td><td>${esc(a.medico)}<br><small>${esc(a.especialidad || "Sin especialidad")}</small></td>
    <td>${esc(fmtDate(a.fecha_hora))}</td><td>${esc(a.motivo)}</td><td>${statusTag(a.estado)}</td>
    <td><div class="actions">
${["Atendida", "Cancelada"].includes(a.estado)
  ? ""
  : `<button class="action-btn" data-edit-appointment="${a.id_cita}">Editar</button>`}
${a.estado === "Pendiente" ? `<button class="action-btn" data-confirm-appointment="${a.id_cita}">Confirmar</button>` : ""}${a.estado === "Confirmada" ? `<button class="action-btn" data-attend-appointment="${a.id_cita}">Marcar atendida</button>` : ""}${!["Cancelada","Atendida"].includes(a.estado) ? `<button class="action-btn danger" data-cancel-appointment="${a.id_cita}">Cancelar</button>` : ""}</div></td>
  </tr>`).join("") : emptyRow(6, "No hay citas que coincidan con la búsqueda.");
}
function field(label, name, type = "text", value = "", opts = {}) {
  const full = opts.full ? " full" : "";
  let control;
  if (type === "select") control = `<select name="${name}" ${opts.required ? "required" : ""}>${opts.options || ""}</select>`;
  else if (type === "textarea") control = `<textarea name="${name}" placeholder="${opts.placeholder || ""}">${esc(value)}</textarea>`;
  else control = `<input name="${name}" type="${type}" value="${esc(value)}" ${opts.required ? "required" : ""} ${opts.placeholder ? `placeholder="${opts.placeholder}"` : ""} ${opts.max ? `maxlength="${opts.max}"` : ""}>`;
  return `<div class="field${full}"><label>${label}${opts.required ? " *" : ""}</label>${control}</div>`;
}
function openModal(type, record = null) {
  state.modalType = type; state.editing = record;
  $("#form-error").textContent = "";
  const isEdit = Boolean(record);
  if (type === "patient") {
    $("#modal-title").textContent = isEdit ? "Editar paciente" : "Registrar paciente";
    $("#form-fields").innerHTML =
      field("Nombre completo","nombre","text",record?.nombre || "",{required:true,max:120}) +
      field("Documento de identidad","documento","text",record?.documento || "",{required:true,max:40}) +
      field("Fecha de nacimiento","fecha_nacimiento","date",record?.fecha_nacimiento || "") +
      field("Teléfono","telefono","tel",record?.telefono || "") +
      field("Correo electrónico","correo","email",record?.correo || "") +
      field("Dirección","direccion","text",record?.direccion || "",{full:true});
  } else {
    $("#modal-title").textContent = isEdit ? "Editar cita médica" : "Programar nueva cita";
    const patientOptions = state.catalogs.pacientes.map(p => `<option value="${p.id_paciente}" ${record?.id_paciente === p.id_paciente ? "selected" : ""}>${esc(p.nombre)} — ${esc(p.documento)}</option>`).join("");
    const doctorOptions = state.catalogs.medicos.map(m => `<option value="${m.id_medico}" ${record?.id_medico === m.id_medico ? "selected" : ""}>${esc(m.nombre)} — ${esc(m.especialidad || "General")}</option>`).join("");
    const dateValue = record?.fecha_hora ? new Date(record.fecha_hora).toISOString().slice(0,16) : "";
    $("#form-fields").innerHTML =
      field("Paciente","id_paciente","select","",{required:true,options:`<option value="">Selecciona un paciente</option>${patientOptions}`}) +
      field("Médico","id_medico","select","",{required:true,options:`<option value="">Selecciona un médico</option>${doctorOptions}`}) +
      field("Fecha y hora","fecha_hora","datetime-local",dateValue,{required:true}) +
      field("Motivo de la cita","motivo","text",record?.motivo || "",{required:true,full:true,max:180}) +
      field("Observaciones","observaciones","textarea",record?.observaciones || "",{full:true});
  }
  $("#modal").classList.remove("hidden");
}
function closeModal() { $("#modal").classList.add("hidden"); state.editing = null; }
$("#modal-form").addEventListener("submit", async (event) => {
  event.preventDefault(); $("#form-error").textContent = "";
  const body = Object.fromEntries(new FormData(event.currentTarget).entries());
  try {
    if (state.modalType === "patient") {
      const url = state.editing ? `/api/pacientes/${state.editing.id_paciente}` : "/api/pacientes";
      await api(url, { method: state.editing ? "PUT" : "POST", body: JSON.stringify(body) });
      toast(state.editing ? "Paciente actualizado." : "Paciente registrado.");
    } else {
      body.id_paciente = Number(body.id_paciente); body.id_medico = Number(body.id_medico);
      const url = state.editing ? `/api/citas/${state.editing.id_cita}` : "/api/citas";
      await api(url, { method: state.editing ? "PUT" : "POST", body: JSON.stringify(body) });
      toast(state.editing ? "Cita actualizada." : "Cita programada.");
    }
    closeModal(); await loadAll();
  } catch (e) { $("#form-error").textContent = e.message; }
});
document.addEventListener("click", async (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.view) showView(target.dataset.view);
  if (target.dataset.go) showView(target.dataset.go);
  if (target.hasAttribute("data-close")) closeModal();
  if (target.id === "new-patient-btn") openModal("patient");
  if (target.id === "new-appointment-btn") {
    if (!state.patients.length) return toast("Primero registra al menos un paciente.");
    openModal("appointment");
  }
  if (target.id === "refresh-btn") { await loadAll(); toast("Datos actualizados."); }
  if (target.dataset.editPatient) openModal("patient", state.patients.find(p => p.id_paciente === Number(target.dataset.editPatient)));
  if (target.dataset.deletePatient) {
    const id = Number(target.dataset.deletePatient);
    if (confirm("¿Seguro que deseas eliminar este paciente? No se podrá eliminar si tiene citas asociadas.")) {
      try { await api(`/api/pacientes/${id}`, {method:"DELETE"}); toast("Paciente eliminado."); await loadAll(); }
      catch(e) { toast(e.message); }
    }
  }
  if (target.dataset.editAppointment) openModal("appointment", state.appointments.find(a => a.id_cita === Number(target.dataset.editAppointment)));
  if (target.dataset.confirmAppointment) {
    const id = Number(target.dataset.confirmAppointment);
    if (confirm("¿Confirmar que el médico aceptó esta cita?")) {
      try { await api(`/api/citas/${id}/confirmar`, {method:"PATCH"}); toast("Cita confirmada."); await loadAll(); }
      catch(e) { toast(e.message); }
    }
  }
  if (target.dataset.attendAppointment) {
    const id = Number(target.dataset.attendAppointment);
    if (confirm("¿Marcar esta cita como atendida? Hazlo solo después de realizar la consulta.")) {
      try { await api(`/api/citas/${id}/atender`, {method:"PATCH"}); toast("Cita marcada como atendida."); await loadAll(); }
      catch(e) { toast(e.message); }
    }
  }
  if (target.dataset.cancelAppointment) {
    const id = Number(target.dataset.cancelAppointment);
    if (confirm("¿Deseas cancelar esta cita?")) {
      try { await api(`/api/citas/${id}/cancelar`, {method:"PATCH"}); toast("Cita cancelada."); await loadAll(); }
      catch(e) { toast(e.message); }
    }
  }
});
$("#patient-search").addEventListener("input", renderPatients);
$("#appointment-search").addEventListener("input", renderAppointments);
$("#status-filter").addEventListener("change", renderAppointments);
document.querySelectorAll("[data-view]").forEach(el => el.addEventListener("click", () => showView(el.dataset.view)));
loadAll();
