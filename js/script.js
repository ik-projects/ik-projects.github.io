let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// algoritma DASS-21

function calculateDASS21() {
  let x = [];
  let y = [];
  let nilaiX = [];
  const answers = submitQuiz();

  answers.forEach((answer, i) => {
    if (answer >= 0) {
      x.push(i + 1);
      y.push(answer);
    } else {
      nilaiX.push(i + 1);
    }
  });

  // console.log("answers lama: ", answers);
  // console.log("x", x);
  // console.log("y", y);
  // console.log("nilai x yang dicari: ", nilaiX);

  // Menghitung spline interpolasi
  const spline = splineInterpolasi(x, y);
  // Menghitung nilai interpolasi untuk beberapa nilai x
  const interpolated_values = nilaiInterpolasi(nilaiX, spline);

  let j = 0;
  for (let i = 0; i < answers.length; i++) {
    if (answers[i] === -1) {
      answers[i] = interpolated_values[j];
      j++;
    }
  }

  // Mencetak hasil interpolasi
  // console.log("Hasil interpolasi spline untuk nilai x:", nilaiX);
  // console.log("Nilai Y yang dicari: ", interpolated_values);
  // console.log("Nilai answers baru: ", answers);

  const depressionItems = [3, 5, 10, 13, 16, 17, 21];
  const anxietyItems = [2, 4, 7, 9, 15, 19, 20];
  const stressItems = [1, 6, 8, 11, 12, 14, 18];

  const depressionScore = calculateSubscaleScore(answers, depressionItems);
  const anxietyScore = calculateSubscaleScore(answers, anxietyItems);
  const stressScore = calculateSubscaleScore(answers, stressItems);

  // console.log("depressionScore: ", depressionScore);

  const depressionInterpretation = interpretScore(depressionScore, "Depresi");
  const anxietyInterpretation = interpretScore(anxietyScore, "Kecemasan");
  const stressInterpretation = interpretScore(stressScore, "Stres");

  document.getElementById("results").innerHTML = `
      <h2>Hasil Tes DSA-21</h2>
        <div class="hasil">
          <div class="level depresi">
            <h2>Depresi</h2>
            <h3>Score: ${depressionScore} | ${depressionInterpretation}<h3/>
          </div>
          <div class="level kecemasan">
            <h2>Kecemasan</h2>
            <h3>Score: ${anxietyScore} | ${anxietyInterpretation}<h3/>
          </div>
          <div class="level stress">
            <h2>Depresi</h2>
            <h3>Score: ${stressScore} | ${stressInterpretation}<h3/>
          </div>
        </div>
  `;
}

function calculateSubscaleScore(answers, items) {
  let score = 0;
  items.forEach((index) => {
    score += answers[index - 1];
    console.log(score);
  });
  return score * 2; // Kalikan 2 untuk versi DASS-21
}

function interpretScore(score, type) {
  const thresholds = {
    Depresi: { Normal: 9, Ringan: 13, Sedang: 20, Berat: 27 },
    Kecemasan: { Normal: 7, Ringan: 9, Sedang: 14, Berat: 19 },
    Stres: { Normal: 14, Ringan: 18, Sedang: 25, Berat: 33 },
  };

  const scale = thresholds[type];
  for (const [level, threshold] of Object.entries(scale)) {
    if (score <= threshold) {
      return level;
    }
  }
  return "Sangat Berat";
}

// Slider
function showSlide(n) {
  slides.forEach((slide, index) => {
    slide.style.display = index === n ? "block" : "none";
  });
  prevBtn.style.display = n === 0 ? "none" : "inline-block";
  nextBtn.style.display = n === slides.length - 1 ? "none" : "inline-block";
}

function changeSlide(n) {
  currentSlide += n;
  showSlide(currentSlide);
}

function submitQuiz() {
  let results = [];

  slides.forEach((slide, index) => {
    const name = `q${index + 1}`;
    const selectedOption = document.querySelector(
      `input[name="${name}"]:checked`
    );
    const value = selectedOption ? parseInt(selectedOption.value) : -1;
    results.push(value);
  });

  results.forEach((result, index) => {
    console.log(`Question ${index + 1}: ${result}`);
  });

  return results;
}

document.addEventListener("DOMContentLoaded", () => {
  showSlide(currentSlide);
});

// interpolasi spline
// Fungsi untuk menghitung interpolasi spline kubik
function splineInterpolasi(x, y) {
  const n = x.length;
  const h = new Array(n - 1);
  const alpha = new Array(n - 1);
  const l = new Array(n);
  const u = new Array(n);
  const z = new Array(n);
  const c = new Array(n).fill(0);
  const b = new Array(n - 1);
  const d = new Array(n - 1);
  const spline = [];

  // Menghitung panjang interval
  for (let i = 0; i < n - 1; i++) {
    h[i] = x[i + 1] - x[i];
  }

  // Menghitung koefisien alpha
  for (let i = 1; i < n - 1; i++) {
    alpha[i] =
      (3 / h[i]) * (y[i + 1] - y[i]) - (3 / h[i - 1]) * (y[i] - y[i - 1]);
  }

  // Solusi sistem tridiagonal
  l[0] = 1;
  u[0] = 0;
  z[0] = 0;

  for (let i = 1; i < n - 1; i++) {
    l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * u[i - 1];
    u[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }

  l[n - 1] = 1;
  z[n - 1] = 0;
  c[n - 1] = 0;

  // Solusi sistem tridiagonal
  for (let j = n - 2; j >= 0; j--) {
    c[j] = z[j] - u[j] * c[j + 1];
    b[j] = (y[j + 1] - y[j]) / h[j] - (h[j] * (c[j + 1] + 2 * c[j])) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  // Membuat spline
  for (let i = 0; i < n - 1; i++) {
    spline.push({
      x0: x[i],
      x1: x[i + 1],
      a: y[i],
      b: b[i],
      c: c[i],
      d: d[i],
    });
  }

  return spline;
}

// Fungsi untuk menghitung nilai interpolasi menggunakan spline untuk beberapa nilai x
function nilaiInterpolasi(x_values, spline) {
  const results = [];
  for (let i = 0; i < x_values.length; i++) {
    let found = false;
    for (let j = 0; j < spline.length; j++) {
      if (x_values[i] >= spline[j].x0 && x_values[i] <= spline[j].x1) {
        const h = x_values[i] - spline[j].x0;
        const interpolated_value =
          spline[j].a +
          spline[j].b * h +
          spline[j].c * Math.pow(h, 2) +
          spline[j].d * Math.pow(h, 3);
        results.push(interpolated_value);
        found = true;
        break;
      }
    }
    if (!found) {
      results.push(null); // x berada di luar rentang spline yang ditentukan
    }
  }
  return results;
}
