/** Shared content model for the on-screen proposal and the jsPDF document. */
export function proposalModel(quote, catalog, business) {
  const service = catalog.services.find((s) => s.id === quote.service);
  const amount = (line) => Number(line.price) * Number(line.quantity);
  const lines = quote.lines.map((line) => ({
    ...line,
    quantity: Number(line.quantity),
    amount: amount(line),
    scope:
      typeof line.scope === "string"
        ? line.scope
            .split("\n")
            .filter(Boolean)
            .map((text) => ({ lead: "", text }))
        : line.scope,
  }));
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const total = Math.max(0, subtotal - Number(quote.discount || 0));
  const greetingName =
    quote.greetingName || quote.clientName.trim().split(/\s+/).at(-1) || "";
  return {
    number: quote.number,
    date: quote.date,
    clientName: quote.clientName,
    clientCompany: quote.clientCompany,
    clientContact: quote.clientContact,
    project: quote.project,
    location: quote.location,
    mode: quote.mode === "presupuesto" ? "presupuesto" : "opciones",
    currency: quote.currency,
    greeting: (
      quote.greeting ??
      service?.greeting ??
      "Estimado/a {nombre}:"
    ).replaceAll("{nombre}", greetingName),
    presentation: quote.presentation ?? service?.presentation ?? "",
    groups: service?.packageGroups || [],
    packages: lines.filter((line) => line.type !== "adicional"),
    additions: lines.filter((line) => line.type === "adicional"),
    additionalTitle: service?.additionalTitle || "SERVICIOS ADICIONALES",
    additionalNote: quote.additionalNote ?? service?.additionalNote ?? "",
    terms: Array.isArray(quote.terms) ? quote.terms : [],
    closing: quote.closing ?? service?.closing ?? "",
    notes: quote.notes,
    subtotal,
    discount: Number(quote.discount || 0),
    total,
    depositPercent: Number(quote.depositPercent),
    deposit: (total * Number(quote.depositPercent)) / 100,
    validityDays: quote.validityDays,
    signature: catalog.document.signature,
    footerSlogan: catalog.document.footerSlogan,
    phone: business.contact.phone || business.contact.whatsapp || "",
    email: business.contact.email || "",
  };
}
export const proposalMoney = (amount, currency) =>
  (currency === "PEN" ? "S/ " : "USD ") +
  Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export function longDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (!Number.isFinite(Date.parse(value + "T12:00:00Z"))) return value;
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value + "T12:00:00Z"));
}
export const scopeText = (bullet) => (bullet.lead || "") + (bullet.text || "");

/** Atomic layout: complete packages, terms and table rows move to the next page. */
export function proposalPdf(model, JsPDF, logo) {
  const doc = new JsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });
  const navy = "#033f5c",
    cyan = "#00aae7",
    pale = "#e7f5fc",
    ink = "#17212b";
  const left = 22,
    width = 166,
    bottom = 275,
    lineHeight = 4.65;
  let y = 73,
    groupShown = new Set();
  const font = (size = 10, bold = false, color = ink) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
  };
  function rich(runs, maxWidth, size = 10) {
    const result = [[]];
    let used = 0;
    for (const run of runs) {
      for (const token of String(run.text || "")
        .split(/(\n|[^\S\n]+|[^\s]+)/)
        .filter(Boolean)) {
        if (token === "\n") {
          result.push([]);
          used = 0;
          continue;
        }
        font(size, run.bold);
        let pieces = [token];
        // Even a single unbroken word must fit within its column.
        if (doc.getTextWidth(token) > maxWidth)
          pieces = doc.splitTextToSize(token, maxWidth);
        for (const piece of pieces) {
          const measure = doc.getTextWidth(piece);
          if (used + measure > maxWidth && used > 0) {
            result.push([]);
            used = 0;
          }
          if (!used && !piece.trim()) continue;
          result.at(-1).push({ text: piece, bold: run.bold, width: measure });
          used += measure;
        }
      }
    }
    return result;
  }
  function draw(lines, x, baseline, size = 10, color = ink) {
    lines.forEach((line, index) => {
      let at = x;
      for (const run of line) {
        font(size, run.bold, color);
        doc.text(run.text, at, baseline + index * lineHeight);
        at += run.width;
      }
    });
  }
  function reserve(height) {
    if (height > bottom - 16)
      throw new Error(
        "Un bloque es demasiado largo para una página. Divide su alcance o reduce el texto.",
      );
    if (y + height > bottom) {
      doc.addPage();
      y = 16;
    }
  }
  function headingHeight(text) {
    return (
      10 +
      (rich([{ text: text.toUpperCase(), bold: true }], width, 11.5).length -
        1) *
        lineHeight
    );
  }
  function heading(text, following = 0) {
    const lines = rich([{ text: text.toUpperCase(), bold: true }], width, 11.5),
      height = headingHeight(text);
    reserve(height + following + 1);
    draw(lines, left, y + 3, 11.5, navy);
    doc.setDrawColor(cyan);
    doc.setLineWidth(0.4);
    doc.line(
      left,
      y + 5.6 + (lines.length - 1) * lineHeight,
      left + width,
      y + 5.6 + (lines.length - 1) * lineHeight,
    );
    y += height;
  }
  function paragraph(
    text,
    { bold = false, italic = false, size = 10, color = ink, gap = 3 } = {},
  ) {
    if (!text) return;
    const lines = rich([{ text, bold }], width, size);
    reserve(lines.length * lineHeight + gap);
    if (italic) {
      font(size, bold, color);
      doc.setFont("helvetica", "italic");
      doc.text(doc.splitTextToSize(text, width), left, y + 3, {
        lineHeightFactor: lineHeight / (size * 0.352778),
      });
    } else draw(lines, left, y + 3, size, color);
    y += lines.length * lineHeight + gap;
  }
  function bulletLines(bullets, maxWidth) {
    return bullets.map((b) =>
      rich(
        [
          { text: b.lead, bold: true },
          { text: b.text, bold: false },
        ],
        maxWidth,
      ),
    );
  }
  function bulletBlock(bullets, x, at, maxWidth) {
    for (const lines of bulletLines(bullets, maxWidth - 4)) {
      doc.setFillColor(cyan);
      doc.circle(x + 0.7, at + 1.8, 0.45, "F");
      draw(lines, x + 4, at + 3);
      at += lines.length * lineHeight + 0.8;
    }
    return at;
  }
  const bulletsHeight = (bullets, maxWidth) =>
    bulletLines(bullets, maxWidth - 4).reduce(
      (sum, lines) => sum + lines.length * lineHeight + 0.8,
      0,
    );
  function groupBox(group) {
    const description = rich(
      [{ text: group.description, bold: true }],
      width - 8,
    );
    const height =
      7 +
      (group.description ? description.length * lineHeight + 1 : 0) +
      bulletsHeight(group.scope, width - 8);
    heading(group.title, height + (group.optionsLabel ? 9 : 0));
    doc.setFillColor(pale);
    doc.rect(left, y, width, height, "F");
    doc.setFillColor(cyan);
    doc.rect(left, y, 0.9, height, "F");
    let at = y + 3;
    if (group.description) {
      draw(description, left + 4, at + 3, 10, navy);
      at += description.length * lineHeight + 1;
    }
    bulletBlock(group.scope, left + 4, at, width - 8);
    y += height + 3;
    if (group.optionsLabel) {
      font(13, true, cyan);
      doc.text(group.optionsLabel, left, y + 3);
      y += 8;
    }
  }
  function investment(item) {
    const cells = [
      {
        label: "Inversión total",
        value: proposalMoney(item.amount, model.currency),
        dark: true,
        size: 68,
      },
      {
        label: item.highlight?.value ? item.highlight.label : "Cantidad",
        value: item.highlight?.value || String(item.quantity) + " " + item.unit,
        size: 49,
      },
      { label: "Modalidad", value: item.modality || item.unit, size: 49 },
    ];
    // Measure values so long, edited metadata never escapes a cell.
    const measured = cells.map((cell) => ({
      ...cell,
      labelLines: rich([{ text: cell.label }], cell.size - 6, 8.5),
      valueLines: rich([{ text: cell.value, bold: true }], cell.size - 6, 10),
    }));
    const height = Math.max(
      13,
      ...measured.map(
        (c) => (c.labelLines.length + c.valueLines.length) * lineHeight + 4,
      ),
    );
    return { cells: measured, height };
  }
  function packageBlock(item) {
    const group = model.groups.find((g) => g.id === item.group);
    const grouped = Boolean(group);
    const tariff = item.priceDisplay === "tarifa" && model.mode === "opciones";
    const titleLines = rich(
      [{ text: item.name, bold: true }],
      width,
      grouped ? 11 : 11.5,
    );
    const description = rich(
      [{ text: item.shortDescription, bold: tariff }],
      width - (grouped ? 0 : 8),
    );
    const scopeWidth = width - (grouped ? 0 : 8);
    const descriptionHeight = item.shortDescription
      ? description.length * lineHeight + 1.8
      : 0;
    const bodyHeight =
      descriptionHeight +
      bulletsHeight(item.scope, scopeWidth) +
      (tariff ? 7 + (item.quantity !== 1 ? 7 : 0) : 0) +
      (grouped ? 0 : 7);
    const bar = tariff ? null : investment(item);
    const barHeight = bar?.height || 0;
    const titleHeight = grouped
      ? titleLines.length * lineHeight + 1.5
      : headingHeight(item.name);
    const entire = titleHeight + bodyHeight + barHeight + 6;
    // Keep a new group heading, its common scope and the first option together.
    if (group && !groupShown.has(group.id)) {
      const groupHeight =
        headingHeight(group.title) +
        7 +
        (group.description
          ? rich([{ text: group.description }], width - 8).length * lineHeight +
            1
          : 0) +
        bulletsHeight(group.scope, width - 8) +
        3 +
        (group.optionsLabel ? 8 : 0);
      reserve(groupHeight + entire);
      groupBox(group);
      groupShown.add(group.id);
    }
    reserve(entire);
    if (grouped) {
      draw(titleLines, left, y + 3, 11);
      y += titleHeight;
    } else heading(item.name, bodyHeight + barHeight + 3);
    if (!grouped) {
      doc.setFillColor(pale);
      doc.rect(left, y, width, bodyHeight, "F");
      doc.setFillColor(cyan);
      doc.rect(left, y, 0.9, bodyHeight, "F");
    }
    const x = left + (grouped ? 0 : 4);
    let at = y + (grouped ? 0 : 3);
    if (item.shortDescription) {
      draw(description, x, at + 3, 10, tariff ? navy : ink);
      at += descriptionHeight;
    }
    if (tariff) {
      const rate = rich(
        [
          { text: "Tarifa: " },
          { text: proposalMoney(item.price, model.currency), bold: true },
          { text: " " + item.modality },
        ],
        width - 8,
      );
      draw(rate, x, at + 3);
      at += 7;
      if (item.quantity !== 1) {
        draw(
          rich(
            [
              { text: "Inversión total: ", bold: true },
              {
                text:
                  proposalMoney(item.amount, model.currency) +
                  " · " +
                  item.quantity +
                  " " +
                  item.unit,
              },
            ],
            width - 8,
          ),
          x,
          at + 3,
        );
        at += 7;
      }
    }
    bulletBlock(item.scope, x, at, scopeWidth);
    y += bodyHeight;
    if (!tariff) {
      const { cells: measured, height } = bar;
      let cellX = left;
      for (const cell of measured) {
        doc.setFillColor(cell.dark ? navy : pale);
        doc.rect(cellX, y, cell.size, height, "F");
        draw(
          cell.labelLines,
          cellX + 3,
          y + 4,
          8.5,
          cell.dark ? "#ffffff" : ink,
        );
        draw(
          cell.valueLines,
          cellX + 3,
          y + 4 + cell.labelLines.length * lineHeight,
          10,
          cell.dark ? "#ffffff" : navy,
        );
        cellX += cell.size;
      }
      y += height;
    }
    y += 6;
  }
  function additions() {
    if (!model.additions.length) return;
    const rows = model.additions.map((item) => {
      const label =
        (item.quantity !== 1 ? item.quantity + " × " : "") + item.name;
      const extra = [item.shortDescription, ...item.scope.map(scopeText)]
        .filter(Boolean)
        .join("\n");
      const split = label.indexOf(" (");
      const lines = rich(
        split < 0
          ? [{ text: label, bold: true }, { text: extra ? "\n" + extra : "" }]
          : [
              { text: label.slice(0, split), bold: true },
              { text: label.slice(split) + (extra ? "\n" + extra : "") },
            ],
        width - 49,
      );
      const amount = rich(
        [
          {
            text: "+ " + proposalMoney(item.amount, model.currency),
            bold: true,
          },
        ],
        41,
      );
      return {
        item,
        lines,
        amount,
        height: Math.max(
          8,
          Math.max(lines.length, amount.length) * lineHeight + 3,
        ),
      };
    });
    heading(model.additionalTitle, 8 + rows[0].height);
    function tableHeader() {
      doc.setFillColor(navy);
      doc.rect(left, y, width, 8, "F");
      font(10, true, "#ffffff");
      doc.text("Servicio", left + 3, y + 5.4);
      doc.text("Inversión adicional", left + width - 3, y + 5.4, {
        align: "right",
      });
      y += 8;
    }
    tableHeader();
    rows.forEach((row, index) => {
      if (y + row.height > bottom) {
        reserve(row.height + 8);
        tableHeader();
      }
      doc.setFillColor(index % 2 ? pale : "#ffffff");
      doc.rect(left, y, width, row.height, "F");
      draw(row.lines, left + 3, y + 5);
      // Right alignment is measured independently for every wrapped amount line.
      row.amount.forEach((line, i) => {
        const runWidth = line.reduce((sum, r) => sum + r.width, 0);
        draw([line], left + width - 3 - runWidth, y + 5 + i * lineHeight);
      });
      doc.setDrawColor("#bddfed");
      doc.setLineWidth(0.2);
      doc.line(left, y + row.height, left + width, y + row.height);
      y += row.height;
    });
    y += 7;
  }
  // Official artwork: 1386 × 2500; never stretch it to a square.
  doc.addImage(logo, "PNG", 11.5, 2, 24, (24 * 2500) / 1386, undefined, "FAST");
  font(20, true, navy);
  doc.text("PROPUESTA COMERCIAL", 112, 44, { align: "center" });
  const recipient = [
    { text: model.clientName, bold: true },
    {
      text: [model.clientCompany, model.clientContact]
        .filter(Boolean)
        .map((text) => "\n" + text)
        .join(""),
    },
  ];
  const clientLines = rich(recipient, 78, 12),
    numberLines = rich(
      [{ text: "N.° de cotización: " }, { text: model.number, bold: true }],
      76,
      9,
    ),
    dateLines = rich(
      [
        { text: "Fecha de emisión: " },
        { text: longDate(model.date), bold: true },
      ],
      76,
      9,
    );
  const headerHeight = Math.max(
    18.5,
    clientLines.length * lineHeight + 10,
    (numberLines.length + dateLines.length) * lineHeight + 7,
  );
  if (headerHeight > 65)
    throw new Error(
      "Los datos del encabezado son demasiado extensos. Acórtalos.",
    );
  doc.setFillColor(pale);
  doc.rect(left, 48, width, headerHeight, "F");
  doc.setFillColor(cyan);
  doc.rect(left, 48, 0.9, headerHeight, "F");
  font(9, true, cyan);
  doc.text("PARA:", left + 4, 53.5);
  draw(clientLines, left + 4, 59, 12, navy);
  draw(numberLines, 109, 56, 9);
  draw(dateLines, 109, 56 + numberLines.length * lineHeight + 0.65, 9);
  y = 48 + headerHeight + 6.5;
  if (model.project || model.location)
    paragraph([model.project, model.location].filter(Boolean).join(" · "), {
      size: 9,
    });
  const presentationHeight =
    (rich([{ text: model.greeting }], width).length +
      (model.presentation
        ? rich([{ text: model.presentation }], width).length
        : 0)) *
      lineHeight +
    7;
  heading("PRESENTACIÓN", presentationHeight);
  paragraph(model.greeting, { gap: 1.8 });
  paragraph(model.presentation, { gap: 5 });
  for (const item of model.packages) packageBlock(item);
  paragraph(model.additionalNote, { italic: true, size: 9, gap: 5 });
  additions();
  if (model.mode === "presupuesto") {
    heading("RESUMEN DEL PRESUPUESTO", 41);
    for (const [label, value, bold] of [
      ["Subtotal", model.subtotal, false],
      ["Descuento", model.discount, false],
      ["Total", model.total, true],
      ["Adelanto (" + model.depositPercent + "%)", model.deposit, true],
    ]) {
      reserve(8);
      if (bold) {
        doc.setFillColor(navy);
        doc.rect(left, y, width, 8, "F");
      }
      font(10, bold, bold ? "#ffffff" : ink);
      doc.text(label, left + 3, y + 5.4);
      doc.text(
        proposalMoney(value, model.currency),
        left + width - 3,
        y + 5.4,
        { align: "right" },
      );
      y += 8;
    }
    y += 3;
    paragraph(
      "Validez: " +
        model.validityDays +
        " días a partir de la fecha de emisión.",
      { size: 9, gap: 5 },
    );
  }
  if (model.terms.length) {
    const terms = model.terms.map((term) =>
      rich(
        [
          { text: term.title ? term.title + ": " : "", bold: true },
          { text: term.text },
        ],
        width - 7,
      ),
    );
    heading(
      "TÉRMINOS Y CONDICIONES DEL SERVICIO",
      terms[0].length * lineHeight + 3,
    );
    terms.forEach((lines, index) => {
      reserve(lines.length * lineHeight + 3);
      font(10, true, navy);
      doc.text(index + 1 + ".", left, y + 3);
      draw(lines, left + 7, y + 3);
      y += lines.length * lineHeight + 3;
    });
  }
  if (model.notes) {
    heading(
      "OBSERVACIONES",
      rich([{ text: model.notes }], width).length * lineHeight + 3,
    );
    paragraph(model.notes);
  }
  const closingLines = model.closing
    ? rich([{ text: model.closing }], width)
    : [];
  const signatureLines = [
    { text: model.signature.name, bold: true },
    { text: model.signature.role },
    { text: model.phone ? "Teléfono / WhatsApp: " + model.phone : "" },
    { text: model.email ? "Correo: " + model.email : "" },
  ].filter((r) => r.text);
  const signatureHeight = signatureLines.reduce(
    (sum, run) => sum + rich([run], width).length * lineHeight,
    0,
  );
  reserve(
    closingLines.length * lineHeight +
      (closingLines.length ? 4 : 0) +
      12 +
      signatureHeight,
  );
  paragraph(model.closing, { gap: 4 });
  paragraph("Atentamente,", { gap: 5 });
  for (const run of signatureLines) {
    const lines = rich([run], width);
    draw(lines, left, y + 3);
    y += lines.length * lineHeight;
  }
  const footer = rich([{ text: model.footerSlogan, bold: true }], 125, 8);
  if (footer.length > 2)
    throw new Error("El eslogan del pie es demasiado largo. Acórtalo.");
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setDrawColor(cyan);
    doc.setLineWidth(0.3);
    if (page > 1) doc.line(left, 282, left + width, 282);
    font(8, true, ink);
    draw(footer, left, footer.length > 1 ? 284.5 : 286.5, 8, ink);
    doc.text("Página " + page + " de " + pages, left + width, 286.5, {
      align: "right",
    });
  }
  return doc;
}
