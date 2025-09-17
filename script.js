// === Chapter Data (Class 9 & 10) ===
const chaptersData = {
  "9": {
    math: [
      "Number Systems","Polynomials","Coordinate Geometry","Linear Equations in Two Variables",
      "Introduction to Euclid's Geometry","Lines and Angles","Triangles","Quadrilaterals",
      "Areas of Parallelograms and Triangles","Circles","Constructions","Heron's Formula",
      "Surface Areas and Volumes","Statistics","Probability"
    ],
    science: [
      "Matter in Our Surroundings","Is Matter Around Us Pure","Atoms and Molecules",
      "Structure of the Atom","The Fundamental Unit of Life","Tissues","Diversity in Living Organisms",
      "Motion","Force and Laws of Motion","Gravitation","Work and Energy","Sound",
      "Why Do We Fall Ill","Natural Resources","Improvement in Food Resources"
    ]
  },
  "10": {
    math: [
      "Real Numbers","Polynomials","Pair of Linear Equations in Two Variables","Quadratic Equations",
      "Arithmetic Progressions","Triangles","Coordinate Geometry","Introduction to Trigonometry",
      "Some Applications of Trigonometry","Circles","Areas Related to Circles","Surface Areas and Volumes",
      "Statistics","Probability"
    ],
    science: [
      "Chemical Reactions and Equations","Acids, Bases and Salts","Metals and Non-metals",
      "Carbon and its Compounds","Life Processes","Control and Coordination","How do Organisms Reproduce?",
      "Heredity","Light - Reflection and Refraction","The Human Eye and the Colourful World",
      "Electricity","Magnetic Effects of Electric Current","Our Environment"
    ]
  }
};

let addedSubjects = [];

const quotes = [
  "Success is the sum of small efforts repeated daily.",
  "Don’t watch the clock; do what it does. Keep going!",
  "Believe in yourself and all that you are.",
  "Push yourself, because no one else is going to do it for you.",
  "Small progress each day adds up to big results."
];

// DOM elements
const classSelect = document.getElementById("classSelect");
const subjectSelect = document.getElementById("subjectSelect");
const chaptersContainer = document.getElementById("chaptersContainer");
const subjectList = document.getElementById("subjectList");
const planDiv = document.getElementById("plan");
const quoteEl = document.getElementById("quote");
const darkToggle = document.getElementById("darkToggle");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const generateBtn = document.getElementById("generateBtn");

// Initial load
loadChapters();

// Load chapter checkboxes
function loadChapters(){
  const cls = classSelect.value;
  const subj = subjectSelect.value;
  const chapters = (chaptersData[cls] && chaptersData[cls][subj]) || [];
  chaptersContainer.innerHTML = "";
  chapters.forEach((ch, idx) => {
    const id = `ch-${cls}-${subj}-${idx}`;
    const wrapper = document.createElement("label");
    wrapper.className = "chapter-checkbox";
    wrapper.innerHTML = `<input type="checkbox" id="${id}" value="${ch}" /> <span>${ch}</span>`;
    // Checkbox change listener to toggle visual checked class
    wrapper.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) wrapper.classList.add("checked");
      else wrapper.classList.remove("checked");
    });
    chaptersContainer.appendChild(wrapper);
  });
}

// Add subject
function addSubject(){
  const cls = classSelect.value;
  const subj = subjectSelect.value;
  const examDateVal = document.getElementById("examDate").value;
  if (!examDateVal) { alert("Please choose an exam date."); return; }

  const checked = Array.from(chaptersContainer.querySelectorAll("input[type='checkbox']:checked"))
                .map(cb => cb.value);

  if (checked.length === 0 && !confirm("No chapters selected. Add subject anyway?")) return;

  addedSubjects.push({
    class: cls,
    subject: subj,
    examDate: new Date(examDateVal + "T23:59:59"),
    chapters: checked
  });
  renderSubjectList();
  document.getElementById("examDate").value = "";
  loadChapters();
}

function renderSubjectList(){
  subjectList.innerHTML = "";
  addedSubjects.forEach((s, i) => {
    const li = document.createElement("li");
    const title = `${capitalize(s.subject)} (Class ${s.class}) — Exam on ${s.examDate.toDateString()}`;
    const chaptersText = s.chapters.length ? s.chapters.join(", ") : "All / General";
    li.innerHTML = `<div>
                      <strong>${title}</strong>
                      <div style="font-size:0.85rem;margin-top:6px;color:var(--muted)">${chaptersText}</div>
                    </div>
                    <button onclick="removeSubject(${i})">Remove</button>`;
    subjectList.appendChild(li);
  });
}

function removeSubject(index){
  addedSubjects.splice(index,1);
  renderSubjectList();
}

// Generate study plan
function generatePlan(){
  if (!addedSubjects.length) { alert("Please add at least one subject."); return; }
  const today = new Date();
  const assignments = [];

  addedSubjects.forEach(s => {
    const exam = new Date(s.examDate.getFullYear(), s.examDate.getMonth(), s.examDate.getDate());
    const daysLeft = Math.ceil((exam - today)/(1000*60*60*24));
    if (daysLeft <= 0) return;

    const chaptersList = s.chapters.length ? s.chapters.slice() : ["General Revision"];
    let chapterIndex = 0;

    for (let i = 1; i <= daysLeft && chapterIndex < chaptersList.length; i++) {
      const assignDate = new Date(today);
      assignDate.setDate(today.getDate() + i);
      if (assignDate > exam) break;
      assignments.push({
        date: new Date(assignDate),
        subject: capitalize(s.subject),
        class: s.class,
        chapters: [chaptersList[chapterIndex]],
        hours: daysLeft <= 3 ? 2 : 1,
        urgency: daysLeft <= 3 ? "urgent" : daysLeft <= 7 ? "soon" : "normal"
      });
      chapterIndex++;
    }
    while (chapterIndex < chaptersList.length) {
      assignments.push({
        date: new Date(exam),
        subject: capitalize(s.subject),
        class: s.class,
        chapters: chaptersList.slice(chapterIndex),
        hours: daysLeft <= 3 ? 3 : 2,
        urgency: daysLeft <= 3 ? "urgent" : daysLeft <= 7 ? "soon" : "normal"
      });
      break;
    }
  });

  assignments.sort((a,b)=>a.date-b.date);

  // Build table with wrapper for horizontal scroll on small screens
  let html = `<div class="table-wrap"><table><thead><tr>
                <th>Date</th><th>Subject</th><th>Chapters</th><th>Hours</th>
              </tr></thead><tbody>`;
  assignments.forEach((a, idx) => {
    // Add stagger animation delay via inline style
    const delayMs = idx * 80;
    html += `<tr class="${a.urgency} plan-row" style="animation-delay:${delayMs}ms">
               <td>${a.date.toDateString()}</td>
               <td>Class ${a.class} — ${a.subject}</td>
               <td>${a.chapters.join(", ")}</td>
               <td>${a.hours} hrs</td>
             </tr>`;
  });
  html += "</tbody></table></div>";
  planDiv.innerHTML = html;
  quoteEl.innerText = `"${quotes[Math.floor(Math.random()*quotes.length)]}"`;

  // Enable PDF button if assignments exist
  downloadPdfBtn.disabled = assignments.length === 0;
}

// Helper
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}

// Dark Mode toggle
function toggleDarkMode(){
  document.body.classList.toggle("dark-mode");
  darkToggle.innerText = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
}

// EXPORT to PDF (only exports the plan table area)
async function exportPlanPDF(){
  // Ensure there's something to export
  if (!planDiv.innerHTML.trim()) { alert("No plan to export. Generate a plan first."); return; }

  // Disable button & show pulse
  downloadPdfBtn.disabled = true;
  const pulse = document.createElement("span");
  pulse.className = "pulse";
  downloadPdfBtn.appendChild(pulse);

  try {
    // Wait a frame so UI updates
    await new Promise(r => requestAnimationFrame(r));

    // Get the node to capture (we capture just the table-wrap if present, else whole planDiv)
    const toCapture = planDiv.querySelector(".table-wrap") || planDiv;

    // html2canvas options
    const opts = {
      scale: 2, // higher quality
      useCORS: true,
      backgroundColor: document.body.classList.contains("dark-mode") ? getComputedStyle(document.body).backgroundColor : null,
      logging: false
    };

    // capture
    const canvas = await html2canvas(toCapture, opts);

    // Create PDF with appropriate orientation and size
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    // A4 dimensions in px at 96dpi approximated by jsPDF's mm constants
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate image dims to fit width with preserved aspect ratio
    const imgProps = { width: canvas.width, height: canvas.height };
    const ratio = imgProps.width / imgProps.height;
    const pdfWidth = pageWidth - 20; // margins
    const pdfHeight = pdfWidth / ratio;

    let y = 10;
    pdf.addImage(imgData, 'PNG', 10, y, pdfWidth, pdfHeight);
    // If content larger than one page, add pages
    let remainingHeightPx = canvas.height - (canvas.width * (pageHeight - 20) / pageWidth);
    if (remainingHeightPx > 0) {
      // split canvas by height
      let position = pdfHeight + 10;
      let canvasCopy = canvas;
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');

      while (position - 10 < (canvas.height * (pageWidth / canvas.width))) {
        // create slice in pixels corresponding to PDF page height
        const sliceHeightPx = Math.floor(canvas.width * ((pageHeight - 20) / pageWidth));
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;

        pageCtx.clearRect(0,0,pageCanvas.width,pageCanvas.height);
        pageCtx.drawImage(canvasCopy, 0, (position - 10) * (canvas.height / (canvas.width * ((pageHeight - 20) / pageWidth))), canvas.width, sliceHeightPx, 0, 0, pageCanvas.width, pageCanvas.height);

        const imgSlice = pageCanvas.toDataURL('image/png');
        pdf.addPage();
        pdf.addImage(imgSlice, 'PNG', 10, 10, pdfWidth, (pdfWidth / pageCanvas.width) * pageCanvas.height);
        position += pageHeight - 20;
      }
    }

    // Save
    const fileName = `study-plan-${new Date().toISOString().slice(0,10)}.pdf`;
    pdf.save(fileName);

  } catch (err) {
    console.error("Error exporting PDF: ", err);
    alert("Failed to export PDF. Try again.");
  } finally {
    // cleanup
    if (pulse.parentNode) downloadPdfBtn.removeChild(pulse);
    downloadPdfBtn.disabled = false;
  }
}

// OPTIONAL: nice little keyboard shortcut: Ctrl+G generates plan
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
    e.preventDefault();
    generatePlan();
  }
});
