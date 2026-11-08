// Dataset de Canciones para el Buscador
const songs = [
  { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock' },
  { title: 'Azul', artist: 'Zoé', genre: 'Indie' },
  { title: 'Just Pretend', artist: 'Bad Omens', genre: 'Rock' },
  { title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop' },
  { title: 'Love is Not Over', artist: 'BTS', genre: 'K-Pop' },
  { title: 'Tití Me Preguntó', artist: 'Bad Bunny', genre: 'Reggaetón' },
  { title: 'Lamento Boliviano', artist: 'Enanitos Verdes', genre: 'Rock' }
];

let timerInterval = null;

// ==========================================
// CARRITO DE COCTELERÍA (DECLARACIÓN GLOBAL)
// ==========================================
window.carritoCocteles = JSON.parse(localStorage.getItem('carritoCoctelesNeon')) || [];

window.updateCartUI = function() {
  const $container = $('#cartItemsList');
  if (!$container.length) return;

  $container.empty();
  let total = 0;

  if (window.carritoCocteles.length === 0) {
    $container.html('<p style="text-align: center; font-style: italic; color: var(--text-muted);">Aún no has agregado consumiciones.</p>');
    $('#cartTotal').text('0 Bs.');
    localStorage.setItem('carritoCoctelesNeon', JSON.stringify([]));
    return;
  }

  window.carritoCocteles.forEach((item, index) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    $container.append(`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; background:rgba(255,255,255,0.04); padding:6px 10px; border-radius:6px;">
        <span><strong>${item.name}</strong> (x${item.qty})</span>
        <div>
          <span style="color:var(--neon-gold); font-weight:700; margin-right:8px;">${subtotal} Bs.</span>
          <button type="button" onclick="window.removeCartItem(${index})" style="background:none; border:none; color:var(--neon-pink); cursor:pointer; font-weight:bold;"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
    `);
  });

  $('#cartTotal').text(total + ' Bs.');
  localStorage.setItem('carritoCoctelesNeon', JSON.stringify(window.carritoCocteles));
};

window.removeCartItem = function(index) {
  window.carritoCocteles.splice(index, 1);
  window.updateCartUI();
};

// ==========================================
// FUNCIONES GENERALES Y RESERVAS
// ==========================================
function calcTotal() {
  const price = parseInt($('#selectRoom').val()) || 80;
  const hours = parseInt($('#selectHours').val()) || 2;
  const total = price * hours;
  $('#calcRoomTotal').text(total + ' Bs.');
  $('#calcGrandTotal').text(total + ' Bs.');
}

function showToast(msg) {
  $('#toastAlert').html(`<i class="fa-solid fa-circle-check"></i> ${msg}`).stop(true, true).slideDown(200).delay(2500).fadeOut(250);
}

function renderSongs(list) {
  const $box = $('#songList').empty();
  if (!list || list.length === 0) {
    $box.append('<div style="text-align:center; color:var(--text-muted); padding:10px;">No se encontraron canciones</div>');
    return;
  }
  list.forEach(s => {
    $box.append(`
      <div style="background:rgba(255,255,255,0.04); padding:8px 12px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
        <span><strong>${s.title}</strong> - ${s.artist}</span>
        <span style="font-size:0.7rem; background:rgba(255,0,127,0.2); color:var(--neon-pink); padding:2px 8px; border-radius:4px;">${s.genre}</span>
      </div>
    `);
  });
}

function openModal() {
  $('#summaryName').text($('#inputName').val());
  $('#summaryPhone').text($('#inputPhone').val());
  $('#summaryDateTime').text($('#inputDate').val() + ' ' + $('#inputTime').val());
  $('#summaryTotal').text($('#calcGrandTotal').text());

  $('#confirmModal').css('display', 'flex').hide().fadeIn(200);

  let count = 10;
  $('#timerDisplay').text(`${count}s`);

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    count--;
    $('#timerDisplay').text(`${count}s`);
    
    if (count <= 0) {
      closeModal();
      showToast("¡Tiempo expirado! La reserva se canceló.");
    }
  }, 1000);
}

function closeModal() {
  clearInterval(timerInterval);
  $('#confirmModal').fadeOut(200);
}

function finishBooking() {
  closeModal();

  const nombre = $('#inputName').val().trim();
  const phone = $('#inputPhone').val().trim();
  const sala = $('#selectRoom option:selected').text();
  const fecha = $('#inputDate').val();
  const hora = $('#inputTime').val();
  const horas = $('#selectHours').val();
  const total = $('#calcGrandTotal').text();

  const nuevaReserva = {
    nombre: nombre,
    telefono: phone,
    sala: sala,
    fecha: fecha,
    hora: hora,
    horas: horas,
    total: total,
    creadoEl: new Date().toLocaleString()
  };

  let listaReservas = JSON.parse(localStorage.getItem('misReservasNeonBeats')) || [];
  listaReservas.push(nuevaReserva);
  localStorage.setItem('misReservasKaraokeGreen', JSON.stringify(listaReservas));

  showToast("¡RESERVA CONFIRMADA Y GUARDADA!");

  const miNumeroWhatsApp = "59175273771"; 
  const textoMensaje = `Hola Karaoke Green, quiero confirmar mi reserva:%0A%0A` +
                       `👤 *Cliente:* ${nombre}%0A` +
                       `📱 *Celular:* ${phone}%0A` +
                       `🎤 *Sala:* ${sala}%0A` +
                       `📅 *Fecha:* ${fecha}%0A` +
                       `⏰ *Hora:* ${hora} (${horas}h)%0A` +
                       `💰 *Total:* ${total}`;

  setTimeout(() => {
    window.open(`https://wa.me/${miNumeroWhatsApp}?text=${textoMensaje}`, '_blank');
  }, 800);

  $('#bookingForm')[0].reset();
  calcTotal();
}

// ==========================================
// INICIALIZACIÓN CON JQUERY
// ==========================================
$(document).ready(function() {
  // Inicializar carrito en la interfaz
  window.updateCartUI();

  // Escuchar clics en botones de Agregar Coctel
  $(document).on('click', '.btn-add-item', function(e) {
    e.preventDefault();
    const name = $(this).attr('data-name');
    const price = parseInt($(this).attr('data-price')) || 0;

    const itemExistente = window.carritoCocteles.find(i => i.name === name);
    if (itemExistente) {
      itemExistente.qty += 1;
    } else {
      window.carritoCocteles.push({ name: name, price: price, qty: 1 });
    }

    window.updateCartUI();
    showToast(`Agregado: ${name}`);
  });

  // Vaciar Carrito
  $(document).on('click', '#btnClearCart', function() {
    window.carritoCocteles = [];
    window.updateCartUI();
    showToast("Carrito vaciado.");
  });

  // Enviar Pedido de Cocteles por WhatsApp
  $(document).on('click', '#btnSendOrder', function() {
    if (window.carritoCocteles.length === 0) {
      alert("Agrega al menos un producto al carrito antes de pedir.");
      return;
    }

    const miNumeroWhatsApp = "59175273771"; 
    let detalle = "";
    let total = 0;

    window.carritoCocteles.forEach(i => {
      const sub = i.price * i.qty;
      total += sub;
      detalle += `• ${i.name} (x${i.qty}) - ${sub} Bs.%0A`;
    });

    const mensaje = `Hola *Karaoke Green*, quiero realizar un pedido para mi sala:%0A%0A` +
                    `${detalle}%0A` +
                    `💰 *TOTAL ADICIONAL:* ${total} Bs.`;

    window.open(`https://wa.me/${miNumeroWhatsApp}?text=${mensaje}`, '_blank');
  });

  // Fecha por defecto en reservas
  if ($('#inputDate').length) {
    $('#inputDate').val(new Date().toISOString().split('T')[0]);
  }

  // Calculadora
  $('#selectRoom, #selectHours').on('change', calcTotal);

  // Buscador de canciones
  if ($('#songList').length) {
    renderSongs(songs);
    $('#songSearch').on('keyup', function() {
      const val = $(this).val().toLowerCase();
      const res = songs.filter(s => s.title.toLowerCase().includes(val) || s.artist.toLowerCase().includes(val));
      renderSongs(res);
    });
  }

  // Formulario de Reserva
  $('#bookingForm').on('submit', function(e) {
    e.preventDefault();
    const name = $('#inputName').val().trim();
    const phone = $('#inputPhone').val().trim();

    if (!name || !phone) {
      showToast("Completa tu nombre y celular.");
      return;
    }
    openModal();
  });

  $('#btnCancelModal').on('click', closeModal);
  $('#btnConfirmModal').on('click', finishBooking);
});
// ==========================================
// FUNCIONALIDAD DE PROMOCIONES
// ==========================================
$(document).ready(function() {
  $(document).on('click', '.btn-claim-promo', function() {
    const promoName = $(this).attr('data-promo');

    // Guardar la promo seleccionada en la memoria del navegador
    localStorage.setItem('promoSeleccionadaNeon', promoName);

    if (typeof showToast === 'function') {
      showToast(`¡Promo aplicada: ${promoName}!`);
    }

    // Número de WhatsApp al que se enviará la consulta de la promo
    const miNumeroWhatsApp = "59175273771"; // Cambia por tu número real
    const mensaje = `Hola Karaoke Green, quiero reclamar y consultar disponibilidad para la siguiente promoción:%0A%0A ${promoName}`;

    // Redirigir a WhatsApp para hacer efectiva la promo
    setTimeout(() => {
      window.open(`https://wa.me/${miNumeroWhatsApp}?text=${mensaje}`, '_blank');
    }, 1000);
  });
});