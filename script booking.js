
    function showDateWarningIfNeeded() {
      const dateField = document.getElementById('datepicker');
      const warning = document.getElementById('date-warning');
      if (!dateField.value.trim()) {
        dateField.classList.add('border-red-500');
        warning.classList.remove('hidden');
        return true;
      } else {
        dateField.classList.remove('border-red-500');
        warning.classList.add('hidden');
        return false;
      }
    }

    const picker = new Litepicker({
      element: document.getElementById('datepicker'),
      format: 'YYYY-MM-DD',
      minDate: new Date(),
      setup: (picker) => {
        picker.on('selected', () => {
          renderTimeSlots();
          showDateWarningIfNeeded();
        });
      }
    });

    const bookedSlots = {};
    let selectedTimes = new Set();

    function renderTimeSlots() {
      const timeSlots = document.getElementById('time-slots');
      timeSlots.innerHTML = '';
      const halfHour = document.getElementById('half-hour').checked;
      const step = halfHour ? 30 : 60;

      const date = document.getElementById('datepicker').value;
      if (!date) return;
      const startHour = 9;
      const endHour = 21;
      const selected = bookedSlots[date] || [];

      for (let h = startHour * 60; h < endHour * 60; h += step) {
        const startH = Math.floor(h / 60);
        const startM = h % 60;
        const endH = Math.floor((h + step) / 60);
        const endM = (h + step) % 60;
        const label = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}-${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

        const isBooked = selected.includes(h);
        const isSelected = selectedTimes.has(h);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.disabled = isBooked;
        btn.className = `border px-4 py-2 rounded ${isBooked ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-gray-200'} ${isSelected ? 'bg-blue-200' : ''}`;
        btn.onclick = () => {
          if (selectedTimes.has(h)) {
            selectedTimes.delete(h);
          } else {
            selectedTimes.add(h);
          }
          renderTimeSlots();
        };
        timeSlots.appendChild(btn);
      }
    }

    function splitIntoSubgroups(times, step) {
      const sorted = [...times].sort((a, b) => a - b);
      const groups = [];
      let group = [sorted[0]];
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i - 1] + step) {
          group.push(sorted[i]);
        } else {
          groups.push(group);
          group = [sorted[i]];
        }
      }
      groups.push(group);
      return groups;
    }

    document.getElementById('half-hour').addEventListener('change', () => {
      if (showDateWarningIfNeeded()) return;

      const warning = document.getElementById('warning-message');
      warning.classList.add('hidden');

      const newSelected = new Set();
      const isHalf = document.getElementById('half-hour').checked;

      if (isHalf) {
        selectedTimes.forEach(h => {
          newSelected.add(h);
        });
      } else {
        const grouped = {};
        selectedTimes.forEach(m => {
          const h = Math.floor(m / 60);
          grouped[h] = (grouped[h] || 0) + 1;
        });
        for (let h in grouped) {
          if (grouped[h] === 2) {
            newSelected.add(parseInt(h) * 60);
          }
        }
        if (Object.values(grouped).some(v => v !== 2)) {
          warning.classList.remove('hidden');
        }
      }

      selectedTimes = newSelected;
      renderTimeSlots();
    });

    document.getElementById('pay-button').addEventListener('click', () => {
      if (showDateWarningIfNeeded()) return;

      const form = document.getElementById('booking-form');
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;
      requiredFields.forEach(field => {
        if (!field.value.trim() || (field.name === 'style' && field.value === '')) {
          field.classList.add('border-red-500');
          valid = false;
        } else {
          field.classList.remove('border-red-500');
        }
      });
      if (!valid || selectedTimes.size === 0) return;

      const times = Array.from(selectedTimes).sort((a, b) => a - b);
      const isHalf = document.getElementById('half-hour').checked;
      let total = 0;
      let blocks = [];
      let block = [times[0]];

      for (let i = 1; i < times.length; i++) {
        if (times[i] === times[i - 1] + (isHalf ? 30 : 60)) {
          block.push(times[i]);
        } else {
          blocks.push(block);
          block = [times[i]];
        }
      }
      blocks.push(block);

      blocks.forEach(group => {
        const duration = group.length * (isHalf ? 30 : 60);
        const isSequential = group.every((val, i, arr) => i === 0 || val === arr[i - 1] + (isHalf ? 30 : 60));

        if (isHalf) {
          if (duration === 30) total += 600;
          else if (duration === 60 && isSequential) total += 1100;
          else if (duration === 60 && !isSequential) total += 600 + 600;
          else if (duration === 90 && isSequential) total += 1600;
          else if (duration === 90 && !isSequential) total += 600 + 600 + 600;
          else if (duration === 120 && isSequential) total += 2000;
          else if (duration === 120 && !isSequential) {
            const subgroups = splitIntoSubgroups(group, 30);
            subgroups.forEach(sg => {
              const d = sg.length * 30;
              if (d === 30) total += 600;
              else if (d === 60) total += 1100;
              else if (d === 90) total += 1600;
            });
          } else if (duration > 120 && isSequential) {
            total += 2000 + ((duration - 120) / 30) * 500;
          } else {
            const subgroups = splitIntoSubgroups(group, 30);
            subgroups.forEach(sg => {
              const d = sg.length * 30;
              if (d === 30) total += 600;
              else if (d === 60) total += 1100;
              else if (d === 90) total += 1600;
              else if (d === 120) total += 2000;
              else if (d > 120) total += 2000 + ((d - 120) / 30) * 500;
            });
          }
        } else {
          if (duration === 60) total += 1100;
          else if (duration === 120 && isSequential) total += 2000;
          else if (duration === 120 && !isSequential) total += 2200;
          else if (duration === 180 && isSequential) total += 3000;
          else if (duration === 180 && !isSequential) total += 2000 + 1100;
          else if (duration > 120 && isSequential && duration % 60 === 0) total += (duration / 60) * 1000;
          else {
            const subgroups = splitIntoSubgroups(group, 60);
            subgroups.forEach(sg => {
              const d = sg.length * 60;
              if (d === 60) total += 1100;
              else if (d === 120 && sg.every((v, i, a) => i === 0 || v === a[i - 1] + 60)) total += 2000;
              else if (d === 120) total += 2200;
              else if (d === 180 && sg.every((v, i, a) => i === 0 || v === a[i - 1] + 60)) total += 3000;
              else if (d > 120 && sg.every((v, i, a) => i === 0 || v === a[i - 1] + 60)) total += (d / 60) * 1000;
              else total += d / 60 * 1100;
            });
          }
        }
      });

      const style = form.style.value;
      const styleOption = form.style.options[form.style.selectedIndex];
      const extra = parseInt(styleOption.dataset.extra || 0);
      total += extra;

      document.getElementById('total-price').textContent = `Total: ${total} DKK`;
      document.getElementById('payment-modal').classList.remove('hidden');

      const date = document.getElementById('datepicker').value;
      bookedSlots[date] = [...(bookedSlots[date] || []), ...Array.from(selectedTimes)];
      selectedTimes.clear();
      renderTimeSlots();
    });

    document.getElementById('close-modal').addEventListener('click', () => {
      document.getElementById('payment-modal').classList.add('hidden');
    });