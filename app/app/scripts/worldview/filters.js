/**
 * Created by FanTaSyLin on 2016/12/22.
 */

(function () {

    "use strict";

    angular.module('Worldview')
        .filter('subLayerItemList', _subLayerItemList);

    function _subLayerItemList() {
        return function(layerList){
            var array = [];
            for (var i = 0; i < layerList.length; i++) {
                if (layerList[i].index <= 5) {
                    array.push(layerList[i]);
                }
            }
            return array;
        }

    }

})();