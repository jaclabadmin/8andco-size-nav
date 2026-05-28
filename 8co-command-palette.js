/**
 * 8co-command-palette.js
 * コマンドパレット（機能1）の雛形
 *
 * 依存: 8co-product-catalog.js（先に読み込むこと）
 * トリガー: Cmd+K / Ctrl+K（ブラウザと競合しにくいショートカット）
 *           または #cmd-palette-trigger ボタン
 */

'use strict';

window.EightCo = window.EightCo || {};

window.EightCo.CommandPalette = (function() {

  /* ---- 内部状態 ---- */
  var _isOpen       = false;
  var _selectedIdx  = -1;
  var _results      = [];
  var _overlay      = null;
  var _input        = null;
  var _resultList   = null;

  /* ---- DOM構築 ---- */
  function _buildDOM() {
    if (document.getElementById('cmd-palette-overlay')) return;

    /* オーバーレイ */
    _overlay = document.createElement('div');
    _overlay.id = 'cmd-palette-overlay';
    _overlay.innerHTML = [
      '<div id="cmd-palette-box" role="dialog" aria-modal="true" aria-label="商品検索">',
      '  <div id="cmd-palette-header">',
      '    <span id="cmd-palette-icon">⌕</span>',
      '    <input id="cmd-palette-input" type="text" placeholder="商品コード・犬種・カテゴリで検索…（例: SMB-M, フレブル, 大型）" autocomplete="off" spellcheck="false">',
      '    <button id="cmd-palette-close" aria-label="閉じる">✕</button>',
      '  </div>',
      '  <ul id="cmd-palette-results" role="listbox"></ul>',
      '  <div id="cmd-palette-footer">',
      '    <span>↑↓ 移動</span><span>Enter 遷移</span><span>Esc 閉じる</span>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(_overlay);

    _input      = document.getElementById('cmd-palette-input');
    _resultList = document.getElementById('cmd-palette-results');

    /* イベント登録 */
    _overlay.addEventListener('click', function(e) {
      if (e.target === _overlay) close();
    });
    document.getElementById('cmd-palette-close').addEventListener('click', close);
    _input.addEventListener('input', _onInput);
    _input.addEventListener('keydown', _onKeyDown);
  }

  /* ---- 検索・レンダリング ---- */
  function _onInput() {
    _results = window.EightCo.search(_input.value);
    _selectedIdx = _results.length > 0 ? 0 : -1;
    _render();
  }

  function _render() {
    if (!_resultList) return;
    _resultList.innerHTML = '';

    if (_results.length === 0) {
      _resultList.innerHTML = '<li class="cmd-no-result">候補が見つかりません</li>';
      return;
    }

    _results.forEach(function(entry, idx) {
      var li = document.createElement('li');
      li.className = 'cmd-result-item' + (idx === _selectedIdx ? ' cmd-selected' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', idx === _selectedIdx ? 'true' : 'false');
      li.innerHTML = [
        '<span class="cmd-code">' + entry.sizeCode + '</span>',
        '<span class="cmd-color">' + entry.colorName + '</span>',
        '<span class="cmd-label">' + entry.label + '</span>',
        '<span class="cmd-category">' + entry.category + '</span>'
      ].join('');

      li.addEventListener('click', function() { _navigate(entry); });
      li.addEventListener('mouseenter', function() {
        _selectedIdx = idx;
        _updateSelection();
      });

      _resultList.appendChild(li);
    });
  }

  function _updateSelection() {
    var items = _resultList.querySelectorAll('.cmd-result-item');
    items.forEach(function(item, idx) {
      item.className = 'cmd-result-item' + (idx === _selectedIdx ? ' cmd-selected' : '');
      item.setAttribute('aria-selected', idx === _selectedIdx ? 'true' : 'false');
    });

    /* 選択項目をスクロール表示 */
    var selected = _resultList.querySelector('.cmd-selected');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }

  /* ---- キーボードナビゲーション ---- */
  function _onKeyDown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        _selectedIdx = Math.min(_selectedIdx + 1, _results.length - 1);
        _updateSelection();
        break;
      case 'ArrowUp':
        e.preventDefault();
        _selectedIdx = Math.max(_selectedIdx - 1, 0);
        _updateSelection();
        break;
      case 'Enter':
        e.preventDefault();
        if (_selectedIdx >= 0 && _results[_selectedIdx]) {
          _navigate(_results[_selectedIdx]);
        }
        break;
      case 'Escape':
        close();
        break;
    }
  }

  /* ---- 遷移処理 ---- */
  function _navigate(entry) {
    /* 履歴に保存（HistoryManagerが存在する場合） */
    if (window.EightCo.HistoryManager) {
      window.EightCo.HistoryManager.save({
        sizeCode:  entry.sizeCode,
        colorName: entry.colorName,
        label:     entry.label,
        url:       entry.url
      });
    }

    close();
    window.location.href = entry.url;
  }

  /* ---- 公開API ---- */
  function open() {
    _buildDOM();
    _isOpen = true;
    _overlay.classList.add('cmd-open');
    _results = window.EightCo.search('');
    _selectedIdx = 0;
    _render();
    setTimeout(function() { if (_input) _input.focus(); }, 50);
  }

  function close() {
    _isOpen = false;
    if (_overlay) _overlay.classList.remove('cmd-open');
    if (_input)   _input.value = '';
  }

  function toggle() { _isOpen ? close() : open(); }

  /* ---- グローバルキーボードショートカット登録 ---- */
  document.addEventListener('keydown', function(e) {
    /* Cmd+K / Ctrl+K */
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggle();
    }
  });

  return { open: open, close: close, toggle: toggle };
})();
