/**
 * Created by FanTaSyLin on 2016/10/18.
 */

(function () {

    'use strict';

    angular.module('Worldview')
        .config(WorldviewConfig);

    WorldviewConfig.$inject = ['$httpProvider'];

    function WorldviewConfig($httpProvider) {

        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';


        /*//Disable IE ajax request caching start
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
        //Disable IE ajax request caching end*/


        delete $httpProvider.defaults.headers.common['X-Requested-With'];

    }

})();