// Charts Component (pure SVG)
(function () {

  window.buildGPACircle = function (gpa, container) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');

    const r = 78, cx = 100, cy = 100;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (gpa / 4.0) * circumference;

    // Tick marks
    for (let i = 0; i < 36; i++) {
      const angle = (i * 10) * Math.PI / 180;
      const inner = 90, outer = 96;
      const x1 = cx + inner * Math.cos(angle);
      const y1 = cy + inner * Math.sin(angle);
      const x2 = cx + outer * Math.cos(angle);
      const y2 = cy + outer * Math.sin(angle);
      const tick = document.createElementNS(svgNS, 'line');
      tick.setAttribute('x1', x1);
      tick.setAttribute('y1', y1);
      tick.setAttribute('x2', x2);
      tick.setAttribute('y2', y2);
      tick.setAttribute('stroke', 'rgba(99,102,241,0.15)');
      tick.setAttribute('stroke-width', i % 3 === 0 ? '2' : '1');
      tick.setAttribute('stroke-linecap', 'round');
      svg.appendChild(tick);
    }

    // Outer decorative ring
    const outerRing = document.createElementNS(svgNS, 'circle');
    outerRing.setAttribute('cx', cx);
    outerRing.setAttribute('cy', cy);
    outerRing.setAttribute('r', r + 8);
    outerRing.setAttribute('fill', 'none');
    outerRing.setAttribute('stroke', 'rgba(99,102,241,0.12)');
    outerRing.setAttribute('stroke-width', '12');
    svg.appendChild(outerRing);

    // Background track
    const bgTrack = document.createElementNS(svgNS, 'circle');
    bgTrack.setAttribute('cx', cx);
    bgTrack.setAttribute('cy', cy);
    bgTrack.setAttribute('r', r);
    bgTrack.setAttribute('fill', 'none');
    bgTrack.setAttribute('stroke', 'var(--color-indigo-100)');
    bgTrack.setAttribute('stroke-width', '10');
    svg.appendChild(bgTrack);

    // Progress arc
    const arc = document.createElementNS(svgNS, 'circle');
    arc.setAttribute('cx', cx);
    arc.setAttribute('cy', cy);
    arc.setAttribute('r', r);
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke', 'var(--color-indigo-500)');
    arc.setAttribute('stroke-width', '10');
    arc.setAttribute('stroke-linecap', 'round');
    arc.setAttribute('stroke-dasharray', circumference);
    arc.setAttribute('stroke-dashoffset', circumference);
    arc.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
    arc.style.setProperty('--circ', circumference);
    arc.style.setProperty('--offset', offset);
    arc.style.transition = 'stroke-dashoffset 1.2s ease-out';
    svg.appendChild(arc);

    // Center text group
    const gpaText = document.createElementNS(svgNS, 'text');
    gpaText.setAttribute('x', cx);
    gpaText.setAttribute('y', cy - 5);
    gpaText.setAttribute('text-anchor', 'middle');
    gpaText.setAttribute('fill', 'var(--text-primary)');
    gpaText.setAttribute('font-size', '2rem');
    gpaText.setAttribute('font-weight', '800');
    gpaText.setAttribute('font-family', 'Inter, Segoe UI, system-ui, sans-serif');
    gpaText.textContent = gpa.toFixed(2);
    svg.appendChild(gpaText);

    const subText = document.createElementNS(svgNS, 'text');
    subText.setAttribute('x', cx);
    subText.setAttribute('y', cy + 20);
    subText.setAttribute('text-anchor', 'middle');
    subText.setAttribute('fill', 'var(--text-muted)');
    subText.setAttribute('font-size', '0.8rem');
    subText.setAttribute('font-family', 'Inter, Segoe UI, system-ui, sans-serif');
    subText.textContent = '/ 4.0';
    svg.appendChild(subText);

    container.appendChild(svg);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        arc.setAttribute('stroke-dashoffset', offset);
      });
    });
  };

  window.buildSparkline = function (data, color, width, height) {
    width = width || 72;
    height = height || 28;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 2;
    const points = data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const lastPoint = points[points.length - 1].split(',');

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${lastPoint[0]}" cy="${lastPoint[1]}" r="2.5" fill="${color}"/>
    </svg>`;
  };

  window.renderActivityBars = function (data, container) {
    const max = Math.max(...data);
    container.style.cssText = 'display:flex; align-items:flex-end; gap:6px; height:48px;';
    data.forEach(val => {
      const bar = document.createElement('div');
      const h = val === 0 ? 4 : Math.max(4, (val / max) * 44);
      const color = val === 0 ? 'var(--bg-elevated)'
                  : val < 4  ? 'rgba(99,102,241,0.25)'
                  : val < 8  ? 'var(--color-indigo-500)'
                  :             '#3730a3';
      bar.style.cssText = `width:8px; height:${h}px; border-radius:3px; background:${color}; flex-shrink:0; transition:height 0.3s ease;`;
      bar.title = `${val} commits`;
      container.appendChild(bar);
    });
  };
})();
