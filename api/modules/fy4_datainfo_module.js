/**
 * Created by lenovo on 2017/10/27.
 */
(function () {
    'use strict';
    var fs = require("fs");
    var moment = require("moment");
    var _ = require("lodash");

    /**
     * 获取数据字段 根据 长度
     * @private
     */
    function _getDataInfo(results) {

        var dataList_Year = [];
        var dataList_Month = [];
        var dataList_Day = [];
        var dataList_Min = [];
        for (var i = 0; i < results.length; i++) {
            var TimeBegin = results[i].StartTime;
            var TimeEnd = results[i].EndTime;

            var BeginMoment = moment(TimeBegin, "YYYYMMDDHHmmss");
            var EndMoment = moment(TimeEnd, "YYYYMMDDHHmmss");
            var BeginTimeStr = TimeBegin;
            while (BeginMoment.isBefore(EndMoment)) {
                var timeYear = BeginMoment.format("YYYY");
                var timeMonth = BeginMoment.format("YYYY-MM");
                var timeDay = BeginMoment.format("YYYY-MM-DD");
                var timeMinute = BeginMoment.format("YYYY-MM-DD hh:mm");
                var YearJson = {TimeStr: timeYear, TimeBegin: BeginTimeStr};
                var MonthJson = {TimeStr: timeMonth, TimeBegin: BeginTimeStr};
                var DayJson = {TimeStr: timeDay, TimeBegin: BeginTimeStr};
                var MinuteJson = {TimeStr: timeMinute, TimeBegin: BeginTimeStr};
                dataList_Year.push(YearJson);
                dataList_Month.push(MonthJson);
                dataList_Day.push(DayJson);
                dataList_Min.push(MinuteJson);

                BeginMoment = BeginMoment.add(1.0, 'minute');
            }


        }
        dataList_Year = _.uniqBy(dataList_Year, "TimeStr");
        dataList_Month = _.uniqBy(dataList_Month, "TimeStr");
        dataList_Day = _.uniqBy(dataList_Day, "TimeStr");
        dataList_Min = _.uniqBy(dataList_Min, "TimeStr");
        return {
            "DataInfoYear": dataList_Year,
            "DataInfoMonth": dataList_Month,
            "DataInfoDay": dataList_Day,
            "DataInfoMinute": dataList_Min
        };
    }

    exports.getDataInfo = _getDataInfo;
})();