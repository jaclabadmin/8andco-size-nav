/**
 * 8co-product-catalog.js
 * CSVのE列データをJS定数として定義し、コマンドパレット・履歴機能の
 * 検索インデックスとして使用する共有データモジュール。
 *
 * 依存: なし（他のモジュールより先に読み込むこと）
 */

'use strict';

/* ============================================================
 * 商品マスターデータ（難読化済み）
 * ============================================================ */
var ENCODED_CATALOG = "W3siY29kZSI6ICJTTUIiLCAibGFiZWwiOiAiUFJFTUlVTSBET0cgV0VBUiBcdTZhMTlcdTZlOTZcdTRmNTNcdTU3OGIgLyBcdTVjMGZcdTU3OGJcdTcyYWMiLCAiY2F0ZWdvcnkiOiAiXHU1YzBmXHU1NzhiIiwgInNpemVzIjogWyJTUyIsICJTIiwgIk0iLCAiTCIsICJMKyIsICJYTCIsICJYTCsiLCAiWFhMIl0sICJiYXNlVXJsIjogImh0dHBzOi8vOC1jby5qcC9jb2xsZWN0aW9ucy9zbWFsbC1icmVlZC9wcm9kdWN0cy9wcmVtaXVtLWRvZy13ZWFyLSVFNiVBOCU5OSVFNiVCQSU5NiVFNCVCRCU5MyVFNSU5RSU4Qi0lRTUlQjAlOEYlRTUlOUUlOEIlRTclOEElQUMiLCAiZGVmYXVsdFZhcmlhbnQiOiAiNDU1MjUzOTAyNjI0NTEiLCAiYnJlZWRzIjogIlx1MzBjOFx1MzBhNFx1MzBmYlx1MzBkN1x1MzBmY1x1MzBjOVx1MzBlYlx1MzAwMVx1MzBjMVx1MzBlZlx1MzBlZlx1MzAwMVx1MzBkZFx1MzBlMVx1MzBlOVx1MzBjYlx1MzBhMlx1MzBmM1x1MzAwMVx1MzBkZVx1MzBlYlx1MzBjMVx1MzBmY1x1MzBiYVx1MzAwMVx1MzBlOFx1MzBmY1x1MzBhZlx1MzBiN1x1MzBlM1x1MzBmY1x1MzBmYlx1MzBjNlx1MzBlYVx1MzBhMiJ9LCB7ImNvZGUiOiAiREFYIiwgImxhYmVsIjogIlBSRU1JVU0gRE9HIFdFQVIgXHU4MGY0XHU5NTc3XHUzMGZiXHU3N2VkXHU4ZGIzXHU0ZjUzXHU1NzhiIiwgImNhdGVnb3J5IjogIlx1NWMwZlx1NTc4YiIsICJzaXplcyI6IFsiU1MiLCAiUyIsICJNIiwgIkwiLCAiWEwiLCAiWFhMIl0sICJiYXNlVXJsIjogImh0dHBzOi8vOC1jby5qcC9jb2xsZWN0aW9ucy9zbWFsbC1icmVlZC9wcm9kdWN0cy9wcmVtaXVtLWRvZy13ZWFyLSVFOCU4MyVCNCVFOSU5NSVCNy0lRTclOUYlQUQlRTglQjYlQjMlRTQlQkQlOTMlRTUlOUUlOEIiLCAiZGVmYXVsdFZhcmlhbnQiOiAiNDU1MjUzOTEyMTI3MjMiLCAiYnJlZWRzIjogIlx1MzBkZlx1MzBjYlx1MzBjMVx1MzBlNVx1MzBhMlx1MzBmYlx1MzBjMFx1MzBjM1x1MzBhZlx1MzBiOVx1MzBkNVx1MzBmM1x1MzBjOVx1MzAwMVx1MzBhYlx1MzBjYlx1MzBmM1x1MzBkOFx1MzBmM1x1MzBmYlx1MzBjMFx1MzBjM1x1MzBhZlx1MzBiOVx1MzBkNVx1MzBmM1x1MzBjOSJ9LCB7ImNvZGUiOiAiUFVHIiwgImxhYmVsIjogIlBSRU1JVU0gRE9HIFdFQVIgXHU5OTk2XHU1OTJhXHUzMGZiXHUzMDRjXHUzMDYzXHUzMDU3XHUzMDhhXHU0ZjUzXHU1NzhiIiwgImNhdGVnb3J5IjogIlx1NWMwZlx1NTc4YiIsICJzaXplcyI6IFsiUyIsICJNIiwgIkwiXSwgImJhc2VVcmwiOiAiaHR0cHM6Ly84LWNvLmpwL2NvbGxlY3Rpb25zL3NtYWxsLWJyZWVkL3Byb2R1Y3RzL3ByZW1pdW0tZG9nLXdlYXItJUU5JUE2JTk2JUU1JUE0JUFBLSVFMyU4MSU4QyVFMyU4MSVBMyVFMyU4MSU5NyVFMyU4MiU4QSVFNCVCRCU5MyVFNSU5RSU4QiIsICJkZWZhdWx0VmFyaWFudCI6ICI0NTUyNTM5MTkwMDg1MSIsICJicmVlZHMiOiAiXHUzMGQxXHUzMGIwXHUzMDAxXHUzMGRhXHUzMGFkXHUzMGNiXHUzMGZjXHUzMGJhIn0sIHsiY29kZSI6ICJGQkQiLCAibGFiZWwiOiAiUFJFTUlVTSBET0cgV0VBUiBcdTMwYWNcdTMwYzNcdTMwYzFcdTMwZWFcdTRmNTNcdTU3OGIgLyBcdTMwZDVcdTMwZWNcdTMwZDZcdTMwZWIiLCAiY2F0ZWdvcnkiOiAiXHU1YzBmXHU1NzhiIiwgInNpemVzIjogWyJTIiwgIk0iLCAiTCJdLCAiYmFzZVVybCI6ICJodHRwczovLzgtY28uanAvY29sbGVjdGlvbnMvc21hbGwtYnJlZWQvcHJvZHVjdHMvcHJlbWl1bS1kb2ctd2Vhci0lRTMlODIlQUMlRTMlODMlODMlRTMlODMlODElRTMlODMlQUElRTQlQkQlOTMlRTUlOUUlOEItJUUzJTgzJTk1JUUzJTgzJUFDJUUzJTgzJTk2JUUzJTgzJUFCIiwgImRlZmF1bHRWYXJpYW50IjogIjQ1NTI1MzkyNDU3OTA3IiwgImJyZWVkcyI6ICJcdTMwZDVcdTMwZWNcdTMwZjNcdTMwYzFcdTMwZmJcdTMwZDZcdTMwZWJcdTMwYzlcdTMwYzNcdTMwYjBcdTMwMDFcdTMwYTJcdTMwZTFcdTMwZWFcdTMwYWJcdTMwZjNcdTMwZmJcdTMwZDRcdTMwYzNcdTMwYzhcdTMwZmJcdTMwZDZcdTMwZWJcdTMwZmJcdTMwYzZcdTMwZWFcdTMwYTIifSwgeyJjb2RlIjogIkJTVCIsICJsYWJlbCI6ICJQUkVNSVVNIERPRyBXRUFSIFx1ODBmOFx1NTM5YVx1MzBmYlx1MzBhMlx1MzBiOVx1MzBlYVx1MzBmY1x1MzBjOFx1NGY1M1x1NTc4YiIsICJjYXRlZ29yeSI6ICJcdTVjMGZcdTU3OGIiLCAic2l6ZXMiOiBbIk0iLCAiTCIsICJYTCJdLCAiYmFzZVVybCI6ICJodHRwczovLzgtY28uanAvY29sbGVjdGlvbnMvc21hbGwtYnJlZWQvcHJvZHVjdHMvcHJlbWl1bS1kb2ctd2Vhci0lRTglODMlQjglRTUlOEUlOUEtJUUzJTgyJUEyJUUzJTgyJUI5JUUzJTgzJUFBJUUzJTgzJUJDJUUzJTgzJTg4JUU0JUJEJTkzJUU1JTlFJThCIiwgImRlZmF1bHRWYXJpYW50IjogIjQ1NTI1Mzk1MDEzODExIiwgImJyZWVkcyI6ICJcdTMwZGNcdTMwYjlcdTMwYzhcdTMwZjNcdTMwYzZcdTMwZWFcdTMwYTIifSwgeyJjb2RlIjogIlNIQiIsICJsYWJlbCI6ICJQUkVNSVVNIERPRyBXRUFSIFx1NmExOVx1NmU5Nlx1NGY1M1x1NTc4YiAvIFx1NGUyZFx1NTc4Ylx1NzJhYyIsICJjYXRlZ29yeSI6ICJcdTRlMmRcdTU3OGIiLCAic2l6ZXMiOiBbIlNTIiwgIlMiLCAiTSIsICJMIl0sICJiYXNlVXJsIjogImh0dHBzOi8vOC1jby5qcC9wcm9kdWN0cy9wcmVtaXVtLWRvZy13ZWFyLSVFNiVBOCU5OSVFNiVCQSU5NiVFNCVCRCU5MyVFNSU5RSU4Qi0lRTQlQjglQUQlRTUlOUUlOEIlRTclOEElQUMiLCAiZGVmYXVsdFZhcmlhbnQiOiAiIiwgImJyZWVkcyI6ICJcdTY3ZjRcdTcyYWNcdTMwMDFcdTMwZDNcdTMwZmNcdTMwYjBcdTMwZWJcdTMwMDFcdTMwZGNcdTMwZmNcdTMwYzBcdTMwZmNcdTMwZmJcdTMwYjNcdTMwZWFcdTMwZmNcdTMwMDFcdTMwYjdcdTMwYTdcdTMwYzNcdTMwYzhcdTMwZTlcdTMwZjNcdTMwYzlcdTMwZmJcdTMwYjdcdTMwZmNcdTMwZDdcdTMwYzlcdTMwYzNcdTMwYjAifSwgeyJjb2RlIjogIkdEUiIsICJsYWJlbCI6ICJQUkVNSVVNIERPRyBXRUFSIFx1NmExOVx1NmU5Nlx1NGY1M1x1NTc4YiAvIFx1NTkyN1x1NTc4Ylx1NzJhYyIsICJjYXRlZ29yeSI6ICJcdTU5MjdcdTU3OGIiLCAic2l6ZXMiOiBbIk0iLCAiTCIsICJYTCJdLCAiYmFzZVVybCI6ICJodHRwczovLzgtY28uanAvcHJvZHVjdHMvcHJlbWl1bS1kb2ctd2Vhci0lRTYlQTglOTklRTYlQkElOTYlRTQlQkQlOTMlRTUlOUUlOEItJUU1JUE0JUE3JUU1JTlFJThCJUU3JThBJUFDIiwgImRlZmF1bHRWYXJpYW50IjogIiIsICJicmVlZHMiOiAiXHUzMGI0XHUzMGZjXHUzMGViXHUzMGM3XHUzMGYzXHUzMGZiXHUzMGVjXHUzMGM4XHUzMGVhXHUzMGZjXHUzMGQwXHUzMGZjXHUzMDAxXHUzMGU5XHUzMGQ2XHUzMGU5XHUzMGM5XHUzMGZjXHUzMGViXHUzMGZiXHUzMGVjXHUzMGM4XHUzMGVhXHUzMGZjXHUzMGQwXHUzMGZjXHUzMDAxXHUzMGI3XHUzMGQ5XHUzMGVhXHUzMGEyXHUzMGYzXHUzMGZiXHUzMGNmXHUzMGI5XHUzMGFkXHUzMGZjIn1d";
var PRODUCT_CATALOG = JSON.parse(decodeURIComponent(escape(window.atob(ENCODED_CATALOG))));

/* ============================================================
 * 検索インデックス生成
 * コード × サイズの全組み合わせ（例: SMB-M, DAX-L ...）をフラット化
 * ============================================================ */
var SEARCH_INDEX = (function buildIndex() {
  var index = [];
  var colors = ['LGR', 'SUMI'];
  var colorLabels = { 'LGR': 'ライトグレー', 'SUMI': 'スミクロ' };

  for (var i = 0; i < PRODUCT_CATALOG.length; i++) {
    var product = PRODUCT_CATALOG[i];

    for (var j = 0; j < product.sizes.length; j++) {
      var size = product.sizes[j];
      var sizeCode = product.code + '-' + size;

      for (var k = 0; k < colors.length; k++) {
        var colorCode = colors[k];
        var colorName = colorLabels[colorCode];

        /* クエリパラメータ付きの遷移URL */
        var url = product.baseUrl
          + '?color=' + encodeURIComponent(colorName)
          + '&size='  + encodeURIComponent(size);
        if (product.defaultVariant) {
          url += '&variant=' + product.defaultVariant;
        }

        index.push({
          /* 検索キー（ユーザーが打つ文字列） */
          sizeCode:   sizeCode,          /* SMB-M */
          colorCode:  colorCode,         /* LGR */
          colorName:  colorName,         /* ライトグレー */

          /* 表示用 */
          label:      product.label,
          category:   product.category,
          breeds:     product.breeds,
          displayText: sizeCode + '  ' + colorName + '  — ' + product.label,

          /* 遷移用 */
          url:        url,
          product:    product            /* 元のproductへの参照 */
        });
      }
    }
  }
  return index;
})();

/**
 * フリーワード検索
 * @param {string} query - 検索文字列（例: "SMB", "フレ", "小型"）
 * @returns {Array} マッチしたエントリー（最大20件）
 */
function searchCatalog(query) {
  if (!query || query.trim() === '') return SEARCH_INDEX.slice(0, 20);

  var q = query.trim().toLowerCase();
  var results = [];

  for (var i = 0; i < SEARCH_INDEX.length; i++) {
    var entry = SEARCH_INDEX[i];
    var haystack = [
      entry.sizeCode,
      entry.colorName,
      entry.label,
      entry.category,
      entry.breeds
    ].join(' ').toLowerCase();

    if (haystack.indexOf(q) !== -1) {
      results.push(entry);
      if (results.length >= 20) break;
    }
  }
  return results;
}

/* グローバルに公開 */
window.EightCo = window.EightCo || {};
window.EightCo.catalog    = PRODUCT_CATALOG;
window.EightCo.searchIndex = SEARCH_INDEX;
window.EightCo.search     = searchCatalog;
