(function () {
  'use strict';

  function initCatalog() {
    var search = document.getElementById('program-search');
    var groups = Array.from(document.querySelectorAll('.channel-group[data-channel]'));
    if (!search || !groups.length) return;

    var filters = Array.from(document.querySelectorAll('[data-channel-filter]'));
    var status = document.getElementById('catalog-status');
    var empty = document.getElementById('catalog-empty');
    var dialog = document.getElementById('program-dialog');
    var dialogBody = document.getElementById('program-dialog-body');
    var activeChannel = 'all';
    var availableChannels = new Set(groups.map(function (group) {
      return group.dataset.channel;
    }));

    function normalize(value) {
      return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').replace(/\s+/g, ' ').trim();
    }

    var entries = groups.map(function (group) {
      return {
        element: group,
        channel: group.dataset.channel,
        cards: Array.from(group.querySelectorAll('.prog-card')).map(function (card) {
          var fields = Array.from(card.querySelectorAll('.prog-card-name, .prog-card-host, .prog-card-day, .prog-card-time'));
          return {
            element: card,
            text: normalize(fields.map(function (field) { return field.textContent; }).join(' '))
          };
        })
      };
    });

    function applyFilters() {
      var terms = normalize(search.value).split(' ').filter(Boolean);
      var count = 0;
      entries.forEach(function (entry) {
        var channelMatches = activeChannel === 'all' || activeChannel === entry.channel;
        var visibleInGroup = 0;
        entry.cards.forEach(function (card) {
          var matches = channelMatches && terms.every(function (term) { return card.text.includes(term); });
          card.element.hidden = !matches;
          if (matches) visibleInGroup += 1;
        });
        entry.element.hidden = visibleInGroup === 0;
        count += visibleInGroup;
      });
      filters.forEach(function (button) {
        var selected = button.dataset.channelFilter === activeChannel;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('is-active', selected);
      });
      if (empty) empty.hidden = count !== 0;
      if (status) status.textContent = count === 1 ? '1 programa disponible' : count + ' programas disponibles';
    }

    function channelFromHash() {
      var hash;
      try { hash = decodeURIComponent(window.location.hash.slice(1)); }
      catch (error) { hash = ''; }
      if (availableChannels.has(hash)) return hash;
      var target = document.getElementById(hash);
      var group = target && target.closest('.channel-group[data-channel]');
      return group && availableChannels.has(group.dataset.channel) ? group.dataset.channel : 'all';
    }

    function setChannel(channel, updateAddress) {
      activeChannel = availableChannels.has(channel) ? channel : 'all';
      applyFilters();
      if (updateAddress) {
        var url = new URL(window.location.href);
        url.hash = activeChannel === 'all' ? '' : activeChannel;
        if (url.href !== window.location.href) {
          try { window.history.replaceState(window.history.state, '', url.href); }
          catch (error) { /* Filtering also works in restricted local-file previews. */ }
        }
      }
    }

    search.addEventListener('input', applyFilters);
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        setChannel(button.dataset.channelFilter, true);
      });
    });
    document.querySelectorAll('[data-clear-search]').forEach(function (button) {
      button.addEventListener('click', function () {
        search.value = '';
        setChannel('all', true);
        search.focus({ preventScroll: true });
      });
    });
    window.addEventListener('hashchange', function () {
      setChannel(channelFromHash(), false);
    });

    if (dialog && dialogBody) {
      function cloneField(source) {
        var clone = source.cloneNode(true);
        clone.removeAttribute('id');
        clone.removeAttribute('hidden');
        clone.querySelectorAll('[id]').forEach(function (element) { element.removeAttribute('id'); });
        return clone;
      }

      document.addEventListener('click', function (event) {
        if (!(event.target instanceof Element)) return;
        var opener = event.target.closest('.program-open');
        if (!opener) return;
        var card = opener.closest('.prog-card');
        if (!card || !card.closest('.channel-group') || card.hidden || dialog.open) return;
        if (typeof dialog.showModal !== 'function') return;

        var layout = document.createElement('div');
        layout.className = 'program-dialog-layout';
        var sourceCover = card.querySelector('.type-cover');
        var sourceVisual = sourceCover || card.querySelector('img');
        if (sourceVisual) {
          var image = cloneField(sourceVisual);
          image.classList.add('program-dialog-image');
          if (sourceCover) image.classList.add('program-dialog-type-cover');
          image.removeAttribute('loading');
          layout.appendChild(image);
        }

        var info = document.createElement('div');
        info.className = 'program-dialog-info';
        var sourceTitle = card.querySelector('.prog-card-name');
        var title = document.createElement('h2');
        title.className = 'prog-card-name';
        title.id = 'program-dialog-title';
        title.textContent = sourceTitle ? sourceTitle.textContent : 'Información del programa';
        info.appendChild(title);
        ['.prog-card-host', '.prog-card-day', '.prog-card-time'].forEach(function (selector) {
          card.querySelectorAll(selector).forEach(function (source) {
            info.appendChild(cloneField(source));
          });
        });
        layout.appendChild(info);
        dialogBody.replaceChildren(layout);
        dialog.setAttribute('aria-labelledby', 'program-dialog-title');
        dialog.showModal();
      });

      dialog.querySelectorAll('[data-close-dialog]').forEach(function (button) {
        button.addEventListener('click', function () { dialog.close(); });
      });
      dialog.addEventListener('click', function (event) {
        if (event.target !== dialog) return;
        var bounds = dialog.getBoundingClientRect();
        var outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (outside) dialog.close();
      });
    }

    setChannel(channelFromHash(), false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCatalog, { once: true });
  else initCatalog();
})();
