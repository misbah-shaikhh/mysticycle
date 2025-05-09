document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('lastPeriodDate');
    const periodInput = document.getElementById('periodLength');
  
    const today = new Date();
    const past = new Date();
    past.setMonth(today.getMonth() - 6);
  
    let selectedDates = JSON.parse(localStorage.getItem('selectedDates')) || [];
    let periodLength = parseInt(localStorage.getItem('periodLength')) || null;
  
    if (periodLength) periodInput.value = periodLength;
  
    flatpickr(dateInput, {
      dateFormat: "Y-m-d",
      mode: "multiple",
      maxDate: today,
      minDate: past,
      showMonths: 3,
      onChange: (dates) => {
        if (dates.length > 3) {
          alert("Please select only up to 3 dates.");
          return;
        }
        selectedDates = dates;
        localStorage.setItem('selectedDates', JSON.stringify(dates));
      }
    });
  
    periodInput.addEventListener('input', () => {
      const len = parseInt(periodInput.value);
      if (!isNaN(len)) {
        localStorage.setItem('periodLength', len);
      }
    });
  });

  function calculateCycleInfo() {
    let selectedDates = JSON.parse(localStorage.getItem('selectedDates')) || [];
    let periodLength = parseInt(localStorage.getItem('periodLength'));
  
    if (selectedDates.length < 3 || isNaN(periodLength)) {
      alert("Please select 3 period start dates and enter your period length.");
      return;
    }
  
    selectedDates = selectedDates.map(d => new Date(d)).sort((a, b) => a - b);
  
    const today = new Date();
    const endDates = selectedDates.map(start => {
      const end = new Date(start);
      end.setDate(start.getDate() + periodLength - 1);
      return end;
    });
  
    // Cycle lengths
    const cycle1 = Math.round((selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24));
    const cycle2 = Math.round((selectedDates[2] - selectedDates[1]) / (1000 * 60 * 60 * 24));
    const avgCycle = Math.round((cycle1 + cycle2) / 2);
    const cycle3 = avgCycle;
  
    // Predict next period
    const nextStart = new Date(selectedDates[2]);
    nextStart.setDate(nextStart.getDate() + avgCycle);
    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextStart.getDate() + periodLength - 1);
  
    const lastEnd = endDates[2];
    const inCurrentCycle = today > lastEnd && today < nextStart;
  
    let currentCycleDay = null;
    let daysUntilNext = null;
    let phase = "";
  
    if (inCurrentCycle) {
      currentCycleDay = Math.ceil((today - lastEnd) / (1000 * 60 * 60 * 24));
      daysUntilNext = Math.ceil((nextStart - today) / (1000 * 60 * 60 * 24));
  
      // Determine phase
      if (currentCycleDay <= 5) {
        phase = "Menstrual phase";
      } else if (currentCycleDay <= 13) {
        phase = "Follicular phase";
      } else if (currentCycleDay === 14) {
        phase = "Ovulation phase";
      } else if (currentCycleDay <= avgCycle) {
        phase = "Luteal phase";
      } else {
        phase = "Waiting for next cycle";
      }
  
      // Update user-info section
      document.getElementById("cycleDayNum").textContent = currentCycleDay;
      document.getElementById("phaseInfo").textContent = `${phase} | Periods in ${daysUntilNext} days`;
  
      // Stats section summary
      document.getElementById("currentCycleInfo").textContent = `You are on day ${currentCycleDay} of your current cycle`;
    } else {
      document.getElementById("currentCycleInfo").textContent = `You are not in a predicted current cycle range yet.`;
      document.getElementById("cycleDayNum").textContent = '-';
      document.getElementById("phaseInfo").textContent = '';
    }
  
    document.getElementById("lastCycleInfo").textContent = `${cycle2} days`;
    document.getElementById("previousCycleInfo").textContent = `${cycle1} days`;
  
    renderCycleStats(cycle1, cycle2, cycle3);
  }
  
// dots in stats 
function renderCycleStats(c1, c2, c3) {
  const maxLength = Math.max(c1, c2, c3);

  function getDotColor(day) {
    if (day <= 5) return "red";
    if (day <= 15) return "teal";
    return "gray";
  }

  function renderDots(containerId, length) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Clear previous

    for (let i = 1; i <= length; i++) {
      const dot = document.createElement("span");
      dot.classList.add("dot", getDotColor(i));
      container.appendChild(dot);
    }
  }

  renderDots("cycle1Dots", c1);
  renderDots("cycle2Dots", c2);
  renderDots("cycle3Dots", c3);
}
