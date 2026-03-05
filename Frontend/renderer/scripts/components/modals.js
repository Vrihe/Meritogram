// Modals Component
(function () {
  window.showModal = function (html) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
        <div class="modal-panel">
          ${html}
        </div>
      </div>
    `;
  };

  window.closeModal = function () {
    document.getElementById('modal-root').innerHTML = '';
  };

  window.showAddEntryModal = function (courseName) {
    const gradeVal = 85;
    showModal(`
      <div class="modal-header">
        <span style="font-size:var(--font-size-lg);font-weight:700;color:var(--text-primary);">Add Entry</span>
        <button class="icon-btn" onclick="closeModal()" style="width:28px;height:28px;font-size:14px;">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Course</label>
          <select class="form-select">
            <option>${courseName || 'Select course...'}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Assignment Name</label>
          <input class="form-input" type="text" placeholder="e.g. Midterm Exam" />
        </div>
        <div class="form-group">
          <label class="form-label">Grade: <span id="grade-val">${gradeVal}%</span></label>
          <input type="range" class="grade-slider" min="0" max="100" value="${gradeVal}" style="--pct:${gradeVal}%;" oninput="this.style.setProperty('--pct', this.value+'%'); document.getElementById('grade-val').textContent=this.value+'%'" />
        </div>
        <div class="form-group">
          <label class="form-label">Attendance</label>
          <div class="attendance-toggle">
            <button class="attendance-btn active-present" onclick="selectAttendance(this,'present')">✓ Present</button>
            <button class="attendance-btn" onclick="selectAttendance(this,'absent')">✕ Absent</button>
            <button class="attendance-btn" onclick="selectAttendance(this,'excused')">⏸ Excused</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="form-input" rows="3" placeholder="Optional notes..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn-primary" onclick="closeModal()">Save Entry</button>
      </div>
    `);
  };

  window.selectAttendance = function (btn, type) {
    const btns = btn.parentElement.querySelectorAll('.attendance-btn');
    btns.forEach(b => b.className = 'attendance-btn');
    const classMap = { present: 'active-present', absent: 'active-absent', excused: 'active-excused' };
    btn.classList.add(classMap[type]);
  };
})();
