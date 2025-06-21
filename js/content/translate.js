async function loadPage(templateJSON, contentJSON) {
  const templateHtml = await fetch(`content/templates/v1.html`).then(res => res.text());
  const html = renderTemplate(templateHtml, templateJSON.v1, contentJSON.v1);
  $('#content').html(html);
}

function renderTemplate(templateStr, templateSchema, contentData) {
  const merged = translate(templateSchema, contentData);

  // Render steps
  const steps = merged.components.content.body.steps.map(step => `
    <div class="step-card">
      <div class="fw-bold fs-5 mb-2">${step.title}</div>
      <div class="mb-2">${step.text}</div>
      ${step.image ? `<img src="${step.image}" class="img-fluid rounded mb-2" alt="">` : ''}
      ${step.video ? `<video src="${step.video}" class="w-100 rounded" controls></video>` : ''}
    </div>
  `).join('');

  const primaryMonsters = merged.components.header.summary.primaryMonsters.map(monster => `
    <li> ${monster} </li>
  `).join('');
  const additionalMonsters = merged.components.header.summary.additionalMonsters.map(monster => `
    <li> ${monster} </li>
  `).join('');

  // Replace steps placeholder first
  let html = templateStr.replace('{{steps}}', steps);
  html = html.replace('{{primaryMonsters}}', primaryMonsters);
  html = html.replace('{{additionalMonsters}}', additionalMonsters);

  // Replace simple {{path.to.value}} placeholders
  html = html.replace(/{{\s*([^}]+)\s*}}/g, (_, path) => {
    const value = path.trim().split('.').reduce((acc, key) => acc?.[key], merged);
    return value != null ? value : '';
  });

  // Replace fake {{#each components.tags}}...{{/each}} (basic support)
  html = html.replace(/{{#each ([^}]+)}}([\s\S]+?){{\/each}}/g, (_, arrayPath, innerTemplate) => {
    const values = arrayPath.split('.').reduce((acc, key) => acc?.[key], merged);
    if (!Array.isArray(values)) return '';
    return values.map(item => innerTemplate.replace(/{{this}}/g, item)).join('');
  });

  return html;
}

function translate(t, c) {
  if (typeof t === 'string') return c ?? '';
  if (Array.isArray(t)) return Array.isArray(c) ? c.map((item, i) => translate(t[0], item)) : [];
  if (typeof t === 'object' && t !== null) {
    const result = {};
    for (const key in t) {
      result[key] = translate(t[key], c?.[key]);
    }
    return result;
  }
  return null;
}