/**
 * Created by FanTaSyLin on 2016/10/18.
 */

(function () {

    "use strict";

    angular.module("Worldview")
        .factory("WorldviewServices", WorldviewServices);

    WorldviewServices.$inject = ['$http'];

    function WorldviewServices($http) {

        var BASEPATH = Config_Total.BASEPATH;

        var self = {
            getLayerGroupList: _getLayerGroupList,
            getProjectInfoList: _getProjectInfoList,
            getDataExistList: _getDataExistList,
            getProjectPalette: _getProjectPalette
        };

        return self;

        /**
         * 获取产品调色板信息
         * @param {String} url 
         * @param {Function} successFn 
         * @param {Function} errorFn 
         */
        function _getProjectPalette(url, successFn, errorFn) {
            $http.get(url).success(successFn).error(errorFn);
        }

        /**
         * 获取产品信息列表
         * @param {Function} successFn
         * @param {Function} errorFn
         */
        function _getProjectInfoList(successFn, errorFn) {
            $http.get(BASEPATH + "/projectinfo").success(successFn).error(errorFn);
        }

        /**
         * 获取图层分组列表
         * @param {Function} successFn 
         * @param {Function} errorFn 
         */
        function _getLayerGroupList(successFn, errorFn) {
            $http.get(BASEPATH + '/layer-group').success(successFn).error(errorFn);
        }

        /**
         * 获取数据有无列表
         * @param {String} url 
         * @param {Function} successFn 
         * @param {Function} errorFn 
         */
        function _getDataExistList(url, successFn, errorFn) {
            $http.get(url).success(successFn).error(errorFn);
        }

    }

})();