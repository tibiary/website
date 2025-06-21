async function loadAndTranslate(template, content) {
  const result = translateTemplate(template, content);
  const html = renderTemplate(result);
  $('#content').html(html);
}

function translateTemplate(template, content) {
  function translate(templateNode, contentNode) {
    if (typeof templateNode === 'string') return contentNode ?? '';
    if (Array.isArray(templateNode)) {
      return Array.isArray(contentNode)
        ? contentNode.map((item, i) => translate(templateNode[0], item))
        : [];
    }
    if (typeof templateNode === 'object' && templateNode !== null) {
      const result = {};
      for (const key in templateNode) {
        result[key] = translate(templateNode[key], contentNode?.[key]);
      }
      return result;
    }
    return null;
  }
  return translate(template, content);
}

function renderTemplate(data) {
  const { v1 } = data;
  const { header, content, footer, tags } = v1.components;

  const stepsHtml = content.body.steps.map(step => 
    `
    <div class="step-card">
      <div class="fw-bold fs-5 mb-2">${step.title}</div>
      <div class="mb-2">${step.text}</div>
      ${step.image ? `<img src="${step.image}" class="img-fluid rounded mb-2" alt="">` : ''}
      ${step.video ? `<video src="${step.video}" class="w-100 rounded" controls></video>` : ''}
    </div>
  `).join('');

  return `
  <div class="bg-white p-4 rounded shadow-sm">

    <!-- Title -->
    <div class="mb-4">
      <div class="fs-3 fw-bold text-primary">${header.title}</div>
      <div class="text-muted mb-1">${header.description}</div>
      <div class="small text-secondary">By <strong>${header.author.name}</strong></div>
      <div class="small text-secondary mb-3">Created: ${header.dateCreated} | Modified: ${header.dateModified}</div>
    </div>

    <!-- Intro + Summary Row -->
    <div class="row mb-4 g-3">
      <!-- Introduction -->
      <div class="col-12 col-lg-8">
        <div class="bg-light-yellow p-3 rounded h-100">
          <div class="section-title">Introduction</div>
          <div class="mb-2">${content.introduction}</div>
          ${content.introductionImage ? `<img src="${content.introductionImage}" class="img-fluid rounded" alt="">` : ''}
        </div>
      </div>

      <!-- Summary -->
      <div class="col-12 col-lg-4">
        <div class="summary-card h-100">
          <div class="fs-5 fw-semibold mb-2">Summary</div>
          <div><strong>Complexity:</strong> ${header.summary.complexity}</div>
          <div><strong>Time:</strong> ${header.summary.time}</div>
          <div><strong>Place:</strong> ${header.summary.place}</div>
          <div><strong>Team Size:</strong> ${header.summary["team-size"]}</div>
          <div><strong>Monster:</strong> ${header.summary.monster}</div>
        </div>
      </div>
    </div>

    <!-- Steps -->
    <div class="mb-4">
      <div class="section-title">Steps</div>
      ${stepsHtml}
    </div>

    <!-- Tags -->
    <div class="mb-4">
      <div class="fw-semibold">Tags:</div>
      <div class="text-muted">${tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')}</div>
    </div>

    <!-- Footer -->
    <div class="border-top pt-3 mt-4">
      <div>${footer.text}</div>
      ${footer.image ? `<img src="${footer.image}" class="img-fluid mt-3 rounded" alt="">` : ''}
    </div>
  </div>
`;
}
