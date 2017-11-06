/**
 * Created by lenovo on 2017/6/5.
 */
var m_resolutions1 = [0.625, 0.3125, 0.15625, 0.078125, 0.0390625, 0.01953125, 0.009765625, 0.0048828125, 0.00244140625];

var m_resolutions = [0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.010986328125 * 2, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.00274658203125 / 2];
var tile_size = 256;
console.log("当前分辨率");
console.log(m_resolutions);
/*
 for (var i = 0; i < m_resolutions.length; i++) {
 var m_re = m_resolutions[i];
 var z = i;
 var x = 360 / (m_re * tile_size);
 var y = 180 / (m_re * tile_size);
 console.log("z:" + z + " x:" + x + " y:" + y);
 if (i > 4) {
 //5层以上
 var m_10Width = 1000;
 var m_index_X = 360 / x / 10;
 var m_index_Y = 180 / y / 10;
 console.log("z:" + z + " 每一块代表度数:" + 360 / x);
 console.log("z:" + z + " x_10度块个数:" + m_index_X + " y_10度块个数:" + m_index_Y);
 }
 }
 */

var m_Base = 0.703125;
var m_xFile = 2;
var m_yFile = 1;
for (var i = 0; i < 9; i++) {

    var m_x = i;
    console.log("第" + m_x + "层分辨率：" + m_Base);
    console.log("第" + m_x + "层 个数 : x:" + m_xFile + " y:" + m_yFile);
    console.log("第" + m_x + "层 宽度 : x:" + m_xFile * 256 + " y:" + m_yFile * 256);
    m_Base = m_Base / 2;
    m_xFile = m_xFile * 2;
    m_yFile = m_xFile * 2;
}