/**
 * 8co-inventory.js
 * 在庫確認API雛形（機能3）
 *
 * 依存: なし
 *
 * 【使い方】
 * goToProduct() の遷移直前に以下を呼ぶ:
 *
 *   var status = await window.EightCo.InventoryChecker.check('SMB', 'LGR');
 *   if (!status.inStock) {
 *     showToast('現在在庫切れです');
 *     return;
 *   }
 *
 * 【本番切り替え方法】
 * INVENTORY_CONFIG.useMock を false に変更し、
 * INVENTORY_CONFIG.endpoint に実際のAPIエンドポイントを設定する。
 */

'use strict';

window.EightCo = window.EightCo || {};

window.EightCo.InventoryChecker = (function() {

  /* ============================================================
   * 設定
   * ============================================================ */
  var INVENTORY_CONFIG = {
    /* false に変更するとリアルAPIを叩く */
    useMock:  true,

    /* 実APIのエンドポイント（将来実装） */
    endpoint: 'https://api.8-co.jp/v1/inventory',

    /* タイムアウト（ms） */
    timeout:  5000,

    /* API失敗時の挙動: 'allow'（遷移を許可） or 'block'（遷移をブロック） */
    onError:  'allow'
  };

  /* ============================================================
   * レスポンス型定義（JSDoc）
   * @typedef {Object} InventoryStatus
   * @property {string}  code      - 商品コード（例: 'SMB'）
   * @property {string}  colorCode - カラーコード（例: 'LGR'）
   * @property {boolean} inStock   - 在庫あり/なし
   * @property {number}  stock     - 在庫数（-1 = 不明）
   * @property {string}  source    - 'mock' | 'api' | 'error-fallback'
   * ============================================================ */

  /* ============================================================
   * モックデータ（開発・デモ用）
   * ============================================================ */
  var MOCK_INVENTORY = {
    'SMB': { 'LGR': { inStock: true,  stock: 24 },
             'SUMI': { inStock: true,  stock: 18 } },
    'DAX': { 'LGR': { inStock: true,  stock: 12 },
             'SUMI': { inStock: false, stock: 0  } },
    'PUG': { 'LGR': { inStock: true,  stock: 8  },
             'SUMI': { inStock: true,  stock: 5  } },
    'FBD': { 'LGR': { inStock: false, stock: 0  },
             'SUMI': { inStock: true,  stock: 3  } },
    'BST': { 'LGR': { inStock: true,  stock: 16 },
             'SUMI': { inStock: true,  stock: 11 } },
    'SHB': { 'LGR': { inStock: true,  stock: 20 },
             'SUMI': { inStock: true,  stock: 14 } },
    'GDR': { 'LGR': { inStock: true,  stock: 7  },
             'SUMI': { inStock: false, stock: 0  } }
  };

  /* ============================================================
   * モック在庫確認（即時返却）
   * ============================================================ */
  function _checkMock(code, colorCode) {
    return new Promise(function(resolve) {
      /* ネットワーク遅延をシミュレート（200〜600ms） */
      setTimeout(function() {
        var product = MOCK_INVENTORY[code];
        var colorData = product ? product[colorCode] : null;

        resolve({
          code:      code,
          colorCode: colorCode,
          inStock:   colorData ? colorData.inStock : true, /* 不明な場合は在庫ありとして扱う */
          stock:     colorData ? colorData.stock   : -1,
          source:    'mock'
        });
      }, Math.floor(Math.random() * 400) + 200);
    });
  }

  /* ============================================================
   * 実API呼び出し（将来実装）
   * ============================================================ */
  function _checkApi(code, colorCode) {
    var url = INVENTORY_CONFIG.endpoint
      + '?code='  + encodeURIComponent(code)
      + '&color=' + encodeURIComponent(colorCode);

    return new Promise(function(resolve, reject) {
      /* タイムアウト設定 */
      var timer = setTimeout(function() {
        reject(new Error('在庫API タイムアウト'));
      }, INVENTORY_CONFIG.timeout);

      fetch(url)
        .then(function(res) {
          clearTimeout(timer);
          if (!res.ok) throw new Error('HTTPエラー: ' + res.status);
          return res.json();
        })
        .then(function(data) {
          resolve({
            code:      code,
            colorCode: colorCode,
            inStock:   !!data.inStock,
            stock:     data.stock || -1,
            source:    'api'
          });
        })
        .catch(reject);
    });
  }

  /* ============================================================
   * 公開API: check(code, colorCode) → Promise<InventoryStatus>
   * ============================================================ */
  function check(code, colorCode) {
    var checker = INVENTORY_CONFIG.useMock ? _checkMock : _checkApi;

    return checker(code, colorCode).catch(function(err) {
      console.warn('[8co] 在庫確認エラー:', err.message);

      /* エラー時のフォールバック */
      return {
        code:      code,
        colorCode: colorCode,
        inStock:   INVENTORY_CONFIG.onError === 'allow', /* 'allow'なら在庫ありとして遷移許可 */
        stock:     -1,
        source:    'error-fallback'
      };
    });
  }

  /* ============================================================
   * UI: モーダル内にステータスバッジを表示
   * （openSzModal() 内や goToProduct() から呼ぶ）
   * ============================================================ */
  function showStatus(status, containerId) {
    var container = document.getElementById(containerId || 'modal-inventory-status');
    if (!container) return;

    var badge = status.inStock
      ? '<span class="inv-badge inv-instock">✓ 在庫あり' + (status.stock > 0 ? '（残り' + status.stock + '点）' : '') + '</span>'
      : '<span class="inv-badge inv-outofstock">✕ 現在品切れ中</span>';

    var sourceNote = status.source === 'mock'
      ? '<span class="inv-mock-note">※ デモデータ表示中</span>'
      : '';

    container.innerHTML = badge + sourceNote;
  }

  /* ============================================================
   * 設定変更用（テスト・開発時に使用）
   * 例: window.EightCo.InventoryChecker.configure({ useMock: false });
   * ============================================================ */
  function configure(opts) {
    Object.keys(opts).forEach(function(key) {
      if (INVENTORY_CONFIG.hasOwnProperty(key)) {
        INVENTORY_CONFIG[key] = opts[key];
      }
    });
  }

  return {
    check:     check,
    showStatus: showStatus,
    configure: configure
  };
})();
