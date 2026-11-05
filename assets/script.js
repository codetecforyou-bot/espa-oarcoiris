(() => {
  // WhatsApp da clínica (DDI + DDD + número, só dígitos).
  const WHATSAPP = "554735123486";

  // Menu mobile
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("menu");
  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("open");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    menu.classList.toggle("open", !open);
  });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) { closeMenu(); toggle.focus(); }
  });

  // Borda do header e botão flutuante
  const header = document.querySelector(".site-header");
  const wa = document.querySelector(".wa-float");
  const contact = document.getElementById("contato");
  let contactVisible = false;
  new IntersectionObserver(([en]) => { contactVisible = en.isIntersecting; onScroll(); }, { threshold: 0.1 }).observe(contact);
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 8);
    wa.classList.toggle("show", y > 600 && !contactVisible);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Links de WhatsApp
  document.querySelectorAll("[data-whatsapp]").forEach((a) => {
    a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Gostaria de informações sobre atendimento no Espaço Arco Íris Psicologia.")}`;
  });

  // Máscara de telefone
  const tel = document.getElementById("telefone");
  tel.addEventListener("input", () => {
    const d = tel.value.replace(/\D/g, "").slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    tel.value = out;
    if (tel.getAttribute("aria-invalid") === "true") validate(tel);
  });

  // Formulário → mensagem pronta no WhatsApp
  const form = document.getElementById("form-contato");
  const status = form.querySelector(".form-status");
  const nome = document.getElementById("nome");

  function setError(input, msg) {
    const el = document.getElementById(`${input.id}-erro`);
    el.textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  function validate(input) {
    if (input === nome) {
      return setError(nome, nome.value.trim().length < 2 ? "Informe seu nome." : "");
    }
    const digits = tel.value.replace(/\D/g, "");
    if (!digits) return setError(tel, "Informe um telefone para retorno.");
    if (digits.length < 10) return setError(tel, "Telefone incompleto. Inclua o DDD.");
    return setError(tel, "");
  }
  nome.addEventListener("blur", () => nome.value && validate(nome));
  tel.addEventListener("blur", () => tel.value && validate(tel));
  nome.addEventListener("input", () => nome.getAttribute("aria-invalid") === "true" && validate(nome));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";
    const okNome = validate(nome);
    const okTel = validate(tel);
    if (!okNome || !okTel) {
      (okNome ? tel : nome).focus();
      status.classList.add("err");
      status.textContent = "Revise os campos destacados.";
      return;
    }
    const data = new FormData(form);
    const msg = [
      `Olá! Meu nome é ${data.get("nome").trim()}.`,
      `Busco atendimento para ${data.get("para")}. Melhor período: ${data.get("periodo")}.`,
      data.get("mensagem").trim() ? `\n${data.get("mensagem").trim()}` : "",
      `\nTelefone para retorno: ${data.get("telefone")}`,
    ].filter(Boolean).join("\n");
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    status.classList.add("ok");
    if (win) {
      status.textContent = "Abrimos o WhatsApp com sua mensagem pronta. É só tocar em enviar.";
    } else {
      status.innerHTML = `Não foi possível abrir o WhatsApp automaticamente. <a href="${url}" target="_blank" rel="noopener">Toque aqui para continuar</a>.`;
    }
  });

  document.getElementById("ano").textContent = new Date().getFullYear();

  // Aberto agora? (seg a sex, 8h às 20h, horário de Brasília)
  const note = document.getElementById("aberto-agora");
  try {
    const parts = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", hour12: false }).formatToParts(new Date());
    const wd = parts.find((p) => p.type === "weekday").value.replace(".", "");
    const h = Number(parts.find((p) => p.type === "hour").value);
    const weekday = !["sáb", "dom"].includes(wd);
    const open = weekday && h >= 8 && h < 20;
    note.textContent = open ? "Aberto agora · fecha às 20h" : "Fechado agora · abre segunda a sexta, às 8h";
    note.classList.toggle("open", open);
  } catch (_) { /* sem Intl: mantém só a tabela */ }
})();
