const form = document.querySelector('[data-quote-form]');
const packagePicker = document.querySelector('[data-package-picker]');
const addonPicker = document.querySelector('[data-addon-picker]');
const hoursField = document.querySelector('[data-hours-field]');
const toast = document.querySelector('[data-toast]');
const draftState = document.querySelector('[data-draft-state]');

const money = (value) => `S/ ${Number(value || 0).toFixed(2)}`;
const localDate = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};
const safeNumber = (value) => Math.max(0, Number(value) || 0);
const showToast = (message) => {
  toast.textContent = message;
  toast.hidden = false;
  window.setTimeout(() => { toast.hidden = true; }, 3600);
};

const config = await fetch('/api/config').then((response) => {
  if (!response.ok) throw new Error('No se pudo cargar la configuración.');
  return response.json();
});

document.querySelector('[data-package-count]').textContent = config.quote.packages.length;
document.querySelector('[data-addon-count]').textContent = config.quote.addons.length;

const storedCounter = Number(localStorage.getItem('clicksolutions_quote_counter'));
const nextCounter = Number.isFinite(storedCounter) && storedCounter > 0 ? storedCounter : config.quote.document.nextNumber;
const defaultQuoteNumber = () => `${config.quote.document.prefix}-${new Date().getFullYear()}-${String(nextCounter).padStart(3, '0')}`;

packagePicker.innerHTML = config.quote.packages.map((item, index) => `
  <label class="package-option">
    <input type="radio" name="package" value="${item.id}" ${index === 0 ? 'checked' : ''} />
    <span><small>${item.eyebrow}</small><strong>${item.name}</strong><b>${item.priceLabel}</b></span>
  </label>
`).join('');

addonPicker.innerHTML = config.quote.addons.map((item) => `
  <label class="addon-option" data-addon-row="${item.id}" data-standard-only="${item.standardOnly}">
    <input type="checkbox" name="addon" value="${item.id}" />
    <span><strong>${item.name}</strong><small>${item.description}</small></span>
    <b>+ ${money(item.price)}</b>
    <input type="number" name="addonQuantity:${item.id}" value="1" min="1" max="20" aria-label="Cantidad para ${item.name}" />
  </label>
`).join('');

form.elements.quoteNumber.value = defaultQuoteNumber();
form.elements.issueDate.value = localDate();
form.elements.validityDays.value = config.quote.document.validityDays;

const getPackage = () => config.quote.packages.find((item) => item.id === new FormData(form).get('package')) || config.quote.packages[0];

function getQuote() {
  const data = new FormData(form);
  const selectedPackage = getPackage();
  const hours = selectedPackage.unit === 'hora' ? Math.max(1, safeNumber(data.get('hours'))) : 1;
  const base = selectedPackage.price * hours;
  const addons = config.quote.addons
    .filter((item) => data.getAll('addon').includes(item.id))
    .map((item) => {
      const quantity = Math.max(1, safeNumber(data.get(`addonQuantity:${item.id}`)));
      return { ...item, quantity, total: item.price * quantity };
    });
  const addonsTotal = addons.reduce((sum, item) => sum + item.total, 0);
  const mobility = safeNumber(data.get('mobility'));
  const discount = safeNumber(data.get('discount'));
  const subtotal = base + addonsTotal + mobility;
  const total = Math.max(0, subtotal - discount);
  const deposit = total * config.quote.document.depositPercent / 100;

  return {
    selectedPackage, hours, base, addons, addonsTotal, mobility, discount, subtotal, total, deposit,
    quoteNumber: String(data.get('quoteNumber') || ''),
    issueDate: String(data.get('issueDate') || ''),
    validityDays: safeNumber(data.get('validityDays')),
    clientName: String(data.get('clientName') || ''),
    clientCompany: String(data.get('clientCompany') || ''),
    clientRole: String(data.get('clientRole') || ''),
    clientContact: String(data.get('clientContact') || ''),
    projectName: String(data.get('projectName') || ''),
    location: String(data.get('location') || ''),
    serviceDate: String(data.get('serviceDate') || ''),
    owner: String(data.get('owner') || ''),
    notes: String(data.get('notes') || ''),
  };
}

function updateAvailability() {
  const selectedPackage = getPackage();
  hoursField.hidden = selectedPackage.unit !== 'hora';
  addonPicker.querySelectorAll('[data-addon-row]').forEach((row) => {
    const disabled = row.dataset.standardOnly === 'true' && selectedPackage.id !== 'standard';
    row.classList.toggle('is-disabled', disabled);
    const checkbox = row.querySelector('input[type="checkbox"]');
    const quantity = row.querySelector('input[type="number"]');
    checkbox.disabled = disabled;
    quantity.disabled = disabled;
    if (disabled) checkbox.checked = false;
  });
}

function updatePreview() {
  updateAvailability();
  const quote = getQuote();
  document.querySelector('[data-preview-number]').textContent = quote.quoteNumber || '—';
  document.querySelector('[data-preview-client]').textContent = quote.clientName || 'Completa el nombre del cliente';
  document.querySelector('[data-preview-project]').textContent = quote.projectName || quote.clientCompany || 'Servicio de drones';
  document.querySelector('[data-preview-package]').textContent = quote.selectedPackage.name;
  document.querySelector('[data-preview-description]').textContent = quote.selectedPackage.description;
  document.querySelector('[data-preview-base]').textContent = money(quote.base);
  document.querySelector('[data-preview-extras]').textContent = money(quote.addonsTotal + quote.mobility);
  document.querySelector('[data-preview-discount]').textContent = `- ${money(quote.discount)}`;
  document.querySelector('[data-preview-total]').textContent = money(quote.total);
  document.querySelector('[data-preview-deposit]').textContent = money(quote.deposit);
  document.querySelector('[data-preview-contact]').textContent = config.business.contact.whatsapp ? `WhatsApp ${config.business.contact.phone || config.business.contact.whatsapp}` : '';
  draftState.textContent = 'Cambios sin guardar';
}

function saveDraft() {
  const values = {};
  new FormData(form).forEach((value, key) => {
    if (key === 'addon') {
      values.addon ||= [];
      values.addon.push(value);
    } else values[key] = value;
  });
  localStorage.setItem('clicksolutions_quote_draft', JSON.stringify(values));
  draftState.textContent = 'Borrador guardado';
  showToast('Borrador guardado únicamente en esta computadora.');
}

function restoreDraft() {
  const raw = localStorage.getItem('clicksolutions_quote_draft');
  if (!raw) return;
  try {
    const values = JSON.parse(raw);
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'addon' && Array.isArray(value)) {
        form.querySelectorAll('input[name="addon"]').forEach((input) => { input.checked = value.includes(input.value); });
        return;
      }
      const field = form.elements.namedItem(key);
      if (!field) return;
      if (field instanceof RadioNodeList) field.value = String(value);
      else field.value = String(value);
    });
    draftState.textContent = 'Borrador recuperado';
  } catch {
    localStorage.removeItem('clicksolutions_quote_draft');
  }
}

const formatLongDate = (value) => value
  ? new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
  : 'Por coordinar';

async function imageAsDataUrl(url) {
  const blob = await fetch(url).then((response) => response.blob());
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function generatePdf(quote) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const pageWidth = 210;
  const margin = 20;
  const usable = pageWidth - margin * 2;
  const navy = [5, 69, 92];
  const cyan = [0, 170, 231];
  const pale = [231, 246, 252];
  const muted = [77, 91, 107];
  const logo = await imageAsDataUrl('/brand/clicksolutions-logo.png').catch(() => null);

  const line = (y) => {
    doc.setDrawColor(...cyan);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageWidth - margin, y);
  };
  const heading = (label, y) => {
    doc.setTextColor(...navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(label, margin, y);
    line(y + 3);
    return y + 10;
  };
  const wrapped = (text, x, y, width, options = {}) => {
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setFontSize(options.size || 10);
    doc.setTextColor(...(options.color || [15, 24, 34]));
    const lines = doc.splitTextToSize(text, width);
    doc.text(lines, x, y, { lineHeightFactor: options.lineHeight || 1.35 });
    return y + lines.length * (options.step || 5);
  };
  const footer = (page, total) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...navy);
    doc.text('ClickSolutions · Soluciones digitales', margin, 286);
    doc.text(`Página ${page} de ${total}`, pageWidth - margin, 286, { align: 'right' });
  };

  if (logo) doc.addImage(logo, 'PNG', margin, 10, 24, 43, undefined, 'FAST');
  doc.setTextColor(...navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('PROPUESTA COMERCIAL', 128, 29, { align: 'center' });
  doc.setFillColor(...pale);
  doc.roundedRect(48, 36, 142, 26, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...cyan);
  doc.text('PARA:', 53, 43);
  doc.setTextColor(...navy);
  doc.setFontSize(12);
  const clientLabel = `${quote.clientRole ? `${quote.clientRole} ` : ''}${quote.clientName}`.trim();
  doc.text(doc.splitTextToSize(clientLabel, 70), 53, 49);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text(`N.º de cotización: ${quote.quoteNumber}`, 120, 44);
  doc.text(`Fecha de emisión: ${formatLongDate(quote.issueDate)}`, 120, 50);
  doc.text(`Vigencia: ${quote.validityDays} días`, 120, 56);

  let y = heading('PRESENTACIÓN', 74);
  y = wrapped(`Estimado${quote.clientName ? ` ${quote.clientName.split(' ')[0]}` : ''}:`, margin, y, usable, { size: 10 });
  y = wrapped(`Es un gusto saludarte. Presentamos esta propuesta para ${quote.projectName || 'tu requerimiento de servicio de drones'}, con un alcance claro, inversión detallada y condiciones coordinadas antes de reservar.`, margin, y + 2, usable, { size: 10 });

  y = heading(quote.selectedPackage.name.toUpperCase(), y + 8);
  const packageBoxTop = y;
  doc.setFillColor(...pale);
  doc.roundedRect(margin, y, usable, 36, 1.5, 1.5, 'F');
  y = wrapped(quote.selectedPackage.description, margin + 5, y + 7, usable - 10, { size: 10, bold: true, color: navy });
  quote.selectedPackage.includes.forEach((item) => {
    doc.setFillColor(...cyan);
    doc.circle(margin + 7, y - 1.2, 0.8, 'F');
    y = wrapped(item, margin + 11, y, usable - 16, { size: 9.5 });
  });
  y = Math.max(y + 6, packageBoxTop + 43);

  y = heading('INVERSIÓN', y);
  const rows = [{ label: `${quote.selectedPackage.name}${quote.selectedPackage.unit === 'hora' ? ` (${quote.hours} h)` : ''}`, amount: quote.base }];
  quote.addons.forEach((item) => rows.push({ label: `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`, amount: item.total }));
  if (quote.mobility > 0) rows.push({ label: 'Movilidad adicional', amount: quote.mobility });
  rows.forEach((row, index) => {
    doc.setFillColor(...(index % 2 ? pale : [249, 251, 252]));
    doc.rect(margin, y, usable, 9, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 33, 45);
    doc.text(row.label, margin + 4, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(money(row.amount), pageWidth - margin - 4, y + 6, { align: 'right' });
    y += 9;
  });
  if (quote.discount > 0) {
    doc.setFillColor(255, 248, 232);
    doc.rect(margin, y, usable, 9, 'F');
    doc.setFont('helvetica', 'normal');
    doc.text('Descuento', margin + 4, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`- ${money(quote.discount)}`, pageWidth - margin - 4, y + 6, { align: 'right' });
    y += 9;
  }
  doc.setFillColor(...navy);
  doc.rect(margin, y + 2, usable, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('INVERSIÓN TOTAL', margin + 5, y + 9);
  doc.setFontSize(14);
  doc.text(money(quote.total), pageWidth - margin - 5, y + 10, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setTextColor(190, 224, 236);
  doc.text(`Adelanto para reservar (${config.quote.document.depositPercent}%): ${money(quote.deposit)}`, margin + 5, y + 16);
  footer(1, 2);

  doc.addPage();
  y = 22;
  y = heading('DETALLES DEL PROYECTO', y);
  const details = [
    ['Proyecto', quote.projectName || 'Por coordinar'],
    ['Empresa', quote.clientCompany || 'No indicada'],
    ['Ubicación', quote.location || 'Por coordinar'],
    ['Fecha tentativa', formatLongDate(quote.serviceDate)],
    ['Contacto', quote.clientContact || 'No indicado'],
  ];
  details.forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + column * 87;
    const boxY = y + row * 18;
    doc.setFillColor(...pale);
    doc.roundedRect(x, boxY, 82, 14, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...cyan);
    doc.text(label.toUpperCase(), x + 4, boxY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    doc.text(doc.splitTextToSize(value, 73)[0], x + 4, boxY + 10.5);
  });
  y += Math.ceil(details.length / 2) * 18 + 6;

  y = heading('TÉRMINOS Y CONDICIONES DEL SERVICIO', y);
  config.quote.terms.forEach((term, index) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...navy);
    doc.text(`${index + 1}.`, margin, y);
    doc.text(`${term.title}:`, margin + 7, y);
    const textLines = doc.splitTextToSize(term.text, usable - 14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(25, 34, 44);
    doc.text(textLines, margin + 7, y + 5, { lineHeightFactor: 1.35 });
    y += Math.max(12, textLines.length * 4.8 + 8);
  });

  if (quote.notes) {
    y = heading('OBSERVACIONES', y + 4);
    y = wrapped(quote.notes, margin, y, usable, { size: 9.5 });
  }
  y = wrapped(config.quote.note, margin, y + 7, usable, { size: 9, color: muted });
  y += 8;
  doc.setTextColor(...navy);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Atentamente,', margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(quote.owner || 'Ing. Anthony Ccayo', margin, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Director de Proyectos · ClickSolutions', margin, y + 13);
  if (config.business.contact.phone) doc.text(`Teléfono / WhatsApp: ${config.business.contact.phone}`, margin, y + 19);
  if (config.business.contact.email) doc.text(`Correo: ${config.business.contact.email}`, margin, y + 25);
  footer(2, 2);

  const filename = `${quote.quoteNumber}-${quote.clientName}`.trim().replace(/[^a-z0-9áéíóúñ-]+/gi, '-').replace(/-+/g, '-');
  doc.save(`${filename || 'Cotizacion-ClickSolutions'}.pdf`);
}

form.addEventListener('input', updatePreview);
form.addEventListener('change', updatePreview);
form.addEventListener('reset', () => {
  window.setTimeout(() => {
    form.elements.quoteNumber.value = defaultQuoteNumber();
    form.elements.issueDate.value = localDate();
    form.elements.validityDays.value = config.quote.document.validityDays;
    localStorage.removeItem('clicksolutions_quote_draft');
    updatePreview();
    draftState.textContent = 'Formulario limpio';
  });
});
document.querySelector('[data-save-draft]').addEventListener('click', saveDraft);
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Generando PDF…';
  try {
    await generatePdf(getQuote());
    localStorage.setItem('clicksolutions_quote_counter', String(nextCounter + 1));
    saveDraft();
    showToast('PDF generado y descargado correctamente.');
  } catch (error) {
    console.error(error);
    showToast('No se pudo generar el PDF. Revisa los datos e inténtalo de nuevo.');
  } finally {
    button.disabled = false;
    button.textContent = 'Generar y descargar PDF';
  }
});

restoreDraft();
updatePreview();
