/**
 * Created by FanTaSyLin on 2016/10/18.
 */

(function () {

    "use strict";

    angular.module("Worldview")
        .factory("WorldviewServices", WorldviewServices);

    WorldviewServices.$inject = ['$http'];

    function WorldviewServices($http) {

        var BASEPATH = 'http://10.24.4.130:4001/api';

        var self = {
            getLayerGroupList: _getLayerGroupList,
            getProjectInfoList: _getProjectInfoList,
            getDataExistList: _getDataExistList
        };

        return self;

        /**
         * 获取产品信息列表
         * @param {Function} successFn
         * @param {Function} errorFn
         */
        function _getProjectInfoList(successFn, errorFn) {
            $http.get(BASEPATH + "/projectinfo").success(successFn).error(errorFn);
        }

        function _getLayerGroupList(successFn, errorFn) {
            $http.get(BASEPATH + '/layer-group').success(successFn).error(errorFn);
        }

        function _getDataExistList(url, successFn, errorFn) {
            $http.get(url).success(successFn).error(errorFn);
        }

    }

})();