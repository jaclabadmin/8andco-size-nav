/**
 * 8&Co. — 商品ページ カラー・サイズ自動選択スクリプト
 * 
 * Size Navigator から遷移した際に、URLパラメータ（color / size）を読み取り、
 * 商品ページ上のカラー・サイズ選択肢を自動でクリック（選択状態に）します。
 * 
 * 【設置方法】
 * Shopify テーマの product.liquid（または PageFly のカスタムHTML）で、
 * </body> の直前にこのスクリプトを読み込んでください。
 * 
 * 例: <script src="https://cdn.shopify.com/.../8co-auto-select.js"></script>
 * または PageFly のカスタムHTML要素に <script>...</script> として貼り付け。
 * 
 * 【対応パラメータ】
 * ?color=ライトグレー&size=M
 * ?color=スミクロ&size=XL
 * 
 * 【localStorage からのフォールバック】
 * URLパラメータがない場合、localStorage の以下のキーも確認します:
 * - 8co_selected_color
 * - 8co_selected_size
 * - 8co_nav_timestamp（5分以内の遷移のみ有効）
 */
(function() {
  'use strict';

  /* ===== ① URLパラメータまたはlocalStorageからカラー・サイズを取得 ===== */
  function getSelectedOptions() {
    var params = new URLSearchParams(window.location.search);
    var color = params.get('color');
    var size  = params.get('size');

    console.log('[8co Debug] URLパラメータから取得:');
    console.log('  - params.get("color"):', color);
    console.log('  - params.get("size"):', size);

    /* URLパラメータがない場合、localStorage をフォールバックとして確認 */
    if (!color && !size) {
      try {
        var ts = parseInt(localStorage.getItem('8co_nav_timestamp') || '0', 10);
        var age = Date.now() - ts;
        /* 5分以内（300秒）の遷移のみ有効 */
        if (age < 300000) {
          color = localStorage.getItem('8co_selected_color') || '';
          size  = localStorage.getItem('8co_selected_size')  || '';
          console.log('[8co Debug] localStorageからフォールバック取得:');
          console.log('  - color:', color);
          console.log('  - size:', size);
        }
      } catch(e) {}
    }

    return { color: color || '', size: size || '' };
  }

  /* ===== ② Shopify商品ページのセレクター候補 ===== */
  /*
   * Shopifyテーマによってセレクター名が異なるため、
   * 複数の一般的なパターンを試みます。
   * ご利用のテーマに合わせて SELECTORS を調整してください。
   */
  var SELECTORS = {
    /* カラースウォッチ / カラーラジオボタン */
    colorOptions: [
      /* PageFly / カスタムセクション */
      '[data-option-name="Color"] input, [data-option-name="color"] input',
      '[data-option-name="カラー"] input',
      /* Shopify標準テーマ (Dawn等) */
      'fieldset[data-option-index] input[type="radio"]',
      '.product-form__input input[type="radio"]',
      /* バリアントセレクト（select要素） */
      'select[data-option-name="Color"], select[data-option-name="カラー"]',
      'select.single-option-selector'
    ],
    /* サイズオプション */
    sizeOptions: [
      '[data-option-name="Size"] input, [data-option-name="size"] input',
      '[data-option-name="サイズ"] input',
      'fieldset[data-option-index] input[type="radio"]',
      '.product-form__input input[type="radio"]',
      'select[data-option-name="Size"], select[data-option-name="サイズ"]',
      'select.single-option-selector'
    ]
  };

  /* ===== ③ オプションをクリック/選択する処理 ===== */
  function selectOptionByValue(selectorList, targetValue, optionType) {
    if (!targetValue) return false;

    var normalizedTarget = targetValue.trim().toLowerCase();

    for (var i = 0; i < selectorList.length; i++) {
      try {
        var elements = document.querySelectorAll(selectorList[i]);
        if (!elements.length) continue;

        for (var j = 0; j < elements.length; j++) {
          var el = elements[j];

          /* input[type="radio"] の場合 */
          if (el.tagName === 'INPUT' && el.type === 'radio') {
            var label = el.labels ? el.labels[0] : null;
            var elValue = (el.value || (label ? label.textContent : '')).trim().toLowerCase();
            if (elValue === normalizedTarget) {
              el.checked = true;
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.click();
              console.log('[8co] ' + optionType + ' 選択: ' + targetValue);
              return true;
            }
          }

          /* select要素の場合 */
          if (el.tagName === 'SELECT') {
            for (var k = 0; k < el.options.length; k++) {
              var optVal = el.options[k].value.trim().toLowerCase();
              var optText = el.options[k].textContent.trim().toLowerCase();
              if (optVal === normalizedTarget || optText === normalizedTarget) {
                el.selectedIndex = k;
                el.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('[8co] ' + optionType + ' 選択 (select): ' + targetValue);
                return true;
              }
            }
          }
        }
      } catch(e) {}
    }

    /* テキストマッチでボタン要素も試行 */
    try {
      var allButtons = document.querySelectorAll(
        'button, [role="button"], label, .swatch, .color-swatch, .size-option, ' +
        '.product-option-value, [data-value]'
      );
      for (var m = 0; m < allButtons.length; m++) {
        var btn = allButtons[m];
        var btnVal = (btn.getAttribute('data-value') || btn.textContent || '').trim().toLowerCase();
        if (btnVal === normalizedTarget) {
          btn.click();
          console.log('[8co] ' + optionType + ' 選択 (button/label): ' + targetValue);
          return true;
        }
      }
    } catch(e) {}

    console.warn('[8co] ' + optionType + ' "' + targetValue + '" の選択要素が見つかりません');
    return false;
  }

  /* ===== ④ メイン処理: ページ読み込み後に実行 ===== */
  function autoSelect() {
    var opts = getSelectedOptions();
    if (!opts.color && !opts.size) return;

    console.log('[8co] 自動選択開始 — color:', opts.color, ', size:', opts.size);

    /* カラーを先に選択（サイズの在庫表示に影響するため） */
    var colorDone = selectOptionByValue(SELECTORS.colorOptions, opts.color, 'カラー');

    /* サイズはカラー選択後にDOMが更新される可能性があるため少し遅延 */
    setTimeout(function() {
      var sizeDone = selectOptionByValue(SELECTORS.sizeOptions, opts.size, 'サイズ');

      if (colorDone || sizeDone) {
        console.log('[8co] 自動選択完了');
      }

      /* 使用済みのlocalStorageを削除 */
      try {
        localStorage.removeItem('8co_selected_color');
        localStorage.removeItem('8co_selected_size');
        localStorage.removeItem('8co_selected_code');
        localStorage.removeItem('8co_nav_timestamp');
      } catch(e) {}
    }, 500);
  }

  /* ===== ⑤ 実行タイミング ===== */
  /*
   * DOMContentLoaded で即時実行 + 
   * 1秒後にリトライ（Shopifyの遅延レンダリング対策）
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(autoSelect, 300);
      setTimeout(autoSelect, 1200);
    });
  } else {
    setTimeout(autoSelect, 300);
    setTimeout(autoSelect, 1200);
  }
})();
