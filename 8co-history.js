/**
 * 8co-history.js
 * 閲覧履歴の保持と表示（機能2）の雛形
 *
 * 依存: なし（単独で動作可能）
 * 保存先: localStorage の '8co_recent_history' キー（JSON配列）
 * 最大件数: 10件（超えた分は古い順に削除、同URLは日時更新でデデュープ）
 */

'use strict';

window.EightCo = window.EightCo || {};

window.EightCo.HistoryManager = (function() {

  var STORAGE_KEY = '8co_recent_history';
  var MAX_ITEMS   = 10;
  var _sidebar    = null;
  var _isExpanded = false;

  /* ============================================================
   * データ操作
   * ============================================================ */

  /** 全履歴を取得 */
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
  }

  /** 履歴を保存（デデュープ + 最大件数制限） */
  function save(entry) {
    /*
     * entry: {
     *   sizeCode:  'SMB-M',
     *   colorName: 'ライトグレー',
     *   label:     'PREMIUM DOG WEAR 標準体型/小型犬',
     *   url:       'https://8-co.jp/...'
     * }
     */
    try {
      var history = load();

      /* 同URLの重複を削除 */
      history = history.filter(function(h) { return h.url !== entry.url; });

      /* 先頭に追加 */
      history.unshift({
        sizeCode:   entry.sizeCode  || '',
        colorName:  entry.colorName || '',
        label:      entry.label     || '',
        url:        entry.url       || '',
        visitedAt:  new Date().toISOString()
      });

      /* 最大件数を超えた分をトリム */
      if (history.length > MAX_ITEMS) history = history.slice(0, MAX_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

      /* サイドバーを更新 */
      renderSidebar();
    } catch(e) {
      console.warn('[8co] 履歴保存失敗:', e);
    }
  }

  /** 履歴を全消去 */
  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      renderSidebar();
    } catch(e) {}
  }

  /* ============================================================
   * UI：サイドバー
   * ============================================================ */

  /** サイドバーのDOMを生成（初回のみ） */
  function _buildSidebar() {
    if (document.getElementById('history-sidebar')) return;

    _sidebar = document.createElement('div');
    _sidebar.id = 'history-sidebar';
    _sidebar.setAttribute('aria-label', '最近見た商品');
    _sidebar.innerHTML = [
      '<button id="history-toggle" aria-expanded="false" title="最近見た商品">',
      '  <span id="history-toggle-icon">🕐</span>',
      '</button>',
      '<div id="history-panel">',
      '  <div id="history-panel-header">',
      '    <span>最近見た商品</span>',
      '    <button id="history-clear" title="履歴を消去">✕ 消去</button>',
      '  </div>',
      '  <ul id="history-list" role="list"></ul>',
      '</div>'
    ].join('');

    document.body.appendChild(_sidebar);

    document.getElementById('history-toggle').addEventListener('click', _togglePanel);
    document.getElementById('history-clear').addEventListener('click', function() {
      if (confirm('閲覧履歴を全て消去しますか？')) clear();
    });
  }

  /** パネルの開閉 */
  function _togglePanel() {
    _isExpanded = !_isExpanded;
    var panel  = document.getElementById('history-panel');
    var toggle = document.getElementById('history-toggle');
    if (!panel || !toggle) return;

    panel.classList.toggle('history-panel-open', _isExpanded);
    toggle.setAttribute('aria-expanded', _isExpanded ? 'true' : 'false');
  }

  /** サイドバーの履歴リストを再描画 */
  function renderSidebar() {
    _buildSidebar();
    var list = document.getElementById('history-list');
    if (!list) return;

    var history = load();
    list.innerHTML = '';

    if (history.length === 0) {
      list.innerHTML = '<li class="history-empty">まだ履歴がありません</li>';
      return;
    }

    history.forEach(function(entry) {
      var li = document.createElement('li');
      li.className = 'history-item';

      /* 訪問日時のフォーマット */
      var date = new Date(entry.visitedAt);
      var timeStr = [
        date.getMonth() + 1, '/',
        date.getDate(),       '  ',
        ('0' + date.getHours()).slice(-2),   ':',
        ('0' + date.getMinutes()).slice(-2)
      ].join('');

      li.innerHTML = [
        '<button class="history-item-btn" title="' + entry.url + '">',
        '  <span class="history-code">'      + (entry.sizeCode  || '—') + '</span>',
        '  <span class="history-color">'     + (entry.colorName || '—') + '</span>',
        '  <span class="history-label">'     + (entry.label     || '—') + '</span>',
        '  <span class="history-time">'      + timeStr + '</span>',
        '</button>'
      ].join('');

      li.querySelector('.history-item-btn').addEventListener('click', function() {
        navigateTo(entry);
      });

      list.appendChild(li);
    });
  }

  /* ============================================================
   * 再遷移
   * ============================================================ */

  function navigateTo(entry) {
    /* コマンドパレットが開いていれば閉じる */
    if (window.EightCo.CommandPalette) {
      window.EightCo.CommandPalette.close();
    }

    /* 再遷移時も履歴を更新（日時を最新に） */
    save(entry);
    window.location.href = entry.url;
  }

  /* ============================================================
   * 初期化（DOMContentLoaded で自動実行）
   * ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderSidebar);
  } else {
    renderSidebar();
  }

  return {
    save:          save,
    load:          load,
    clear:         clear,
    renderSidebar: renderSidebar,
    navigateTo:    navigateTo
  };
})();
