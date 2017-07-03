/**
 * Created by lenovo on 2017/3/1.
 */


function Palette() {
    var self = this;
    //总体DIV
    self.target_div = "";
    //总体ID值
    self.target_div_ID = "";
    //渐变div 的ID
    //详情显示DIV
    self.m_BeginJson = {};
    //初始化函数
    this.init_palette = function (m_DivID, m_Json) {
        self.target_div_ID = m_DivID;
        self.target_div = document.getElementById(m_DivID);
        //解析 m_Json
        self.m_BeginJson = m_Json;
        //对数据正确性进行校验
        if (json_CheckFunc()) {
            //根据json 初始化 显示模式 分为3 钟模式  1.单块模式 -single 2.渐变调色板模式 -gradient 3.阈值调色板模式 -range 0.默认模式-default
            init_ShowMode();
            //根据显示模式 初始化
            init_div();
        }
    };

    //显示模式  1.单块模式 -single 2.渐变调色板模式 -gradient 3.阈值调色板模式 -range 0.默认模式-default
    self.palette_Mode = "default";
    self.single_data = [];
    var gradient_data = [];
    self.single_Num = 0;
    var gradient_Num = 0;
    var gradient_Min = 0;
    var gradient_Max = 0;

    //json 格式校验
    var json_CheckFunc = function () {
        if (self.target_div == undefined) {
            console.log("当前初始化调色板部件为空：" + self.target_div_ID);
            return false;
        }
        if (self.m_BeginJson.palette_mode == undefined) {
            console.log("调色板控件json格式错误：palette_mode 不能为空。");
            return false;
        }

        switch (self.m_BeginJson.palette_mode) {
            case "single":
            {

                if (self.m_BeginJson.single == undefined) {
                    console.log("调色板控件json格式错误：single 不能为空。");
                    return false;
                }
                break;
            }
            case "gradient":
            {
                if (self.m_BeginJson.gradient == undefined) {
                    console.log("调色板控件json格式错误：gradient 不能为空。");
                    return false;
                }
                break;
            }
            case "range":
            {
                if (self.m_BeginJson.range == undefined) {
                    console.log("调色板控件json格式错误：range 不能为空。");
                    return false;
                }
                break;
            }
            default:
            {
                console.log("调色板控件json格式错误：palette_mode 需要为single gradient range中的一个。");
                return false;
            }
        }
        return true;
    };

    /**
     * 解析json文件
     * @constructor
     */
    var init_ShowMode = function () {
        //判断模式

        //根据模式 进行json初始化
        switch (self.m_BeginJson.palette_mode) {
            case "single":
            {
                self.palette_Mode = "single";
                init_json_single();
                break;
            }
            case "gradient":
            {
                self.palette_Mode = "gradient";
                init_json_gradient();
                break;
            }
            case "range":
            {
                self.palette_Mode = "range";
                init_json_range();
                break;
            }
            default:
            {
                self.palette_Mode = "unknown";
                console.log("当前模式未知：" + self.m_BeginJson.palette_mode);
                break;
            }
        }

    };

    /**
     * 初始化 json中single 部分
     */
    function init_json_single() {
        if (self.m_BeginJson.single != undefined) {
            self.single_data = self.m_BeginJson.single;
            //解析single
            self.single_Num = self.single_data.length;
        }
    }

    /**
     *初始化  json中 gradient 部分
     */
    function init_json_gradient() {
        if (self.m_BeginJson.gradient != undefined) {
            gradient_data = self.m_BeginJson.gradient;
            //解析gradient
            gradient_Num = gradient_data.length;
            gradient_Min = gradient_data[0][0];
            gradient_Max = gradient_data[gradient_Num - 1][0];
        }
    }

    //阶段调色板数据
    var range_data = [];

    //阶段调色板的数据
    var range_num = 0;

    /**
     * 初始化 json 中的range 部分的数据
     */
    function init_json_range() {
        if (self.m_BeginJson.range != undefined) {
            var m_data = self.m_BeginJson.range;
            for (var i = 0; i < m_data.length; i++) {
                var m_Item = m_data[i];
                if (m_Item.length == 2) {
                    range_data.push(m_Item);
                }
            }
            range_num = range_data.length;
        }
    }

    /**
     * 初始化整体DIV显示
     */
    var init_div = function () {
        //通过主DIV 设置
        var palette_Html = '';
        switch (self.palette_Mode) {
            case "single":
            {
                palette_Html = init_single();
                break;
            }
            case "gradient":
            {
                palette_Html = init_gradient();
                break;
            }
            case "range":
            {
                //todo 添加分块调色板
                palette_Html = init_range();
                break;
            }
            default:
            {
                console.log("当前模式未知：" + self.palette_Mode);
                break;
            }
        }

        var m_detailHtml = init_detail();
        var TotalInner = palette_Html + m_detailHtml + "</div>";
        //内容赋值入 html
        self.target_div.innerHTML = TotalInner;

        switch (self.palette_Mode) {
            case "single":
            {
                //todo 初始化 single 事件
                init_single_func();
                break;
            }
            case "gradient":
            {
                //初始化 渐变调色板 div
                init_gradient_canvas();
                //对调色板div 中canvas的各个事件进行处理
                try {
                    init_gradient_func();
                } catch (e) {
                    console.log(e);
                }
                break;
            }
            case "range":
            {
                //todo 添加分块调色板
                //  self.palette_Mode = "range";
                try {
                    init_range_func();
                } catch (e) {
                    console.log(e);
                }
                break;
            }
            default:
            {
                console.log("当前模式未知：" + self.palette_Mode);
                break;
            }
        }

    };

    /**
     * 初始化 单块列表
     * @returns {string}
     */
    var init_single = function () {
        var m_inner = '<div id="Show_Color_plate" style="width: 100%;height: 100%;overflow: hidden;">';
        //根据当前的singleNum 进行显示
        if (self.single_Num > 0) {
            // m_inner = '<div id="Show_Color_plate">';
            for (var i = 0; i < self.single_Num; i++) {
                var m_single_data_i = self.single_data[i];
                // var m_single_data_i_value = m_single_data_i[0];
                var m_single_data_i_color = m_single_data_i[1];
                var m_single_data_i_color_rgb = "rgb(" + m_single_data_i_color[0] + "," +
                    m_single_data_i_color[1] + "," + m_single_data_i_color[2] + ")";
                var m_single_data_i_title = m_single_data_i[2];
                var m_singleMember = '<canvas style="width: 20px; height: 20px; position: relative;  '
                    + ' border:1px solid #404040;margin: 2px; float:left;'
                    + 'background-color: ' + m_single_data_i_color_rgb + ';"'
                    + 'title="' + m_single_data_i_title + '"'
                    + 'id="single_canvas_' + i + '"'
                    + 'class="single_canvas_' + self.target_div_ID + '"></canvas>';

                m_inner = m_inner + m_singleMember;
            }

        }
        //   m_inner = m_inner + '</div>';
        return m_inner;
    };

    //初始化 single_func
    var init_single_func = function () {
        var m_Canvas = document.getElementsByClassName('single_canvas_' + self.target_div_ID);
        for (var i = 0; i < m_Canvas.length; i++) {
            m_Canvas[i].onmouseover = single_canvasMouseOver;
            m_Canvas[i].onmouseout = single_canvasMouseOut;
            m_Canvas[i].onmousemove = single_canvasMouseMove;
        }
    };

    //single canvas 鼠标进入
    var single_canvasMouseOver = function (event) {
        var m_event = event.currentTarget;
        var backgroundColor = m_event.style.backgroundColor;
        var title = m_event.title;
        var Show_Color_detail_canvas = document.getElementById(self.detail_canvas_id);
        Show_Color_detail_canvas.style.backgroundColor = backgroundColor;
        var Show_Color_detail_a = document.getElementById(self.detail_a_id);
        Show_Color_detail_a.innerHTML = title;
        //显示部分
        var Show_Color_detail = document.getElementById(self.detail_id);
        Show_Color_detail.style.display = "block";
    };

    //single canvas 鼠标移出
    var single_canvasMouseOut = function (event) {
        var Show_Color_detail_canvas = document.getElementById(self.detail_id);
        Show_Color_detail_canvas.style.display = "none";
    };

    //single canvas 鼠标移动
    var single_canvasMouseMove = function (event) {
        // var canvas = document.getElementById(self.target_div);
        var m_MaxWidth = $("#" + self.target_div_ID).width();
        var max = event.offsetX + event.currentTarget.offsetLeft + 10 + 100;
        if (event.offsetX + event.currentTarget.offsetLeft + 10 + 100 < m_MaxWidth) {
            //设置位置
            $("#" + self.detail_id).css({
                "top": (event.currentTarget.offsetTop - 5) + "px",
                "left": (event.offsetX + event.currentTarget.offsetLeft + 10) + "px"
            });
        }
        else {
            //设置位置
            $("#" + self.detail_id).css({
                "top": (event.currentTarget.offsetTop - 5) + "px",
                "left": (event.offsetX + event.currentTarget.offsetLeft - 10 - 100) + "px"
            });
        }
    };


    //渐变div id
    self.gradient_id = '';
    //渐变 canvas id
    self.gradient_canvas_id = '';

    //初始化 过度列表
    var init_gradient = function () {
        self.gradient_id = self.target_div_ID + "_gradient";
        self.gradient_canvas_id = self.target_div_ID + "_gradient" + "_canvas";
        var m_inner = "<div id='" + self.gradient_id + "'>"
            + "<canvas style='width: 100%;height:10px;border:1px solid #404040;' id='" + self.gradient_canvas_id + "' title=''> "
            + "</canvas>"
            + "<div style='width:100%;height: 12px; margin-top:-5px;font-size: 8px;'>"
            + "<p style='float: left;'>" + gradient_Min.toFixed(2) + "</p>"
            + "<p style='float: right;'>" + gradient_Max.toFixed(2) + "</p>"
                //  + "</div>"
            + "</div>";
        return m_inner;
    };

    //初始化事件 gradient_func
    var init_gradient_func = function () {
        var m_Canvas = document.getElementById(self.gradient_canvas_id);
        m_Canvas.onmouseover = gradient_canvasMouseOver;
        m_Canvas.onmouseout = gradient_canvasMouseOut;
        m_Canvas.onmousemove = gradient_canvasMouseMove;
    };

    /**
     * 渐变调色板 鼠标移入操作 显示详情界面
     * @param event
     */
    var gradient_canvasMouseOver = function (event) {
        var Show_Color_detail_canvas = document.getElementById(self.detail_id);
        Show_Color_detail_canvas.style.display = "block";
    };

    /**
     * 渐变调色板 鼠标移出操作 隐藏详情界面
     * @param event
     */
    var gradient_canvasMouseOut = function (event) {
        var Show_Color_detail_canvas = document.getElementById(self.detail_id);
        Show_Color_detail_canvas.style.display = "none";
    };

    /**
     * 渐变调色板 鼠标在调色板中移动操作 更新详情界面信息
     * @param event
     */
    var gradient_canvasMouseMove = function (event) {
        //计算title详情
        var canvas = document.getElementById(self.gradient_canvas_id);
        var m_MaxWidth = $("#" + self.target_div_ID).width();
        var rect = canvas.getBoundingClientRect();
        var relative_x = event.clientX - rect.left;
        canvas.title = ( gradient_Min + ((gradient_Max - gradient_Min) / m_MaxWidth * relative_x)).toFixed(2);
        canvas.style.cursor = "crosshair";
        //获取鼠标当前点
        var context = canvas.getContext("2d");
        var imagedata = context.getImageData(relative_x, 5, 1, 1);
        var m_rgb = "rgb(" + imagedata.data[0] + "," + imagedata.data[1] + "," + imagedata.data[2] + ")";
        //详情中canvas 颜色 显示部分
        var Show_Color_detail_canvas = document.getElementById(self.detail_canvas_id);
        Show_Color_detail_canvas.style.background = m_rgb;
        //详情中文字部分
        var Show_Color_detail_a = document.getElementById(self.detail_a_id);
        Show_Color_detail_a.innerHTML = ( gradient_Min + ((gradient_Max - gradient_Min) / m_MaxWidth * relative_x)).toFixed(2);

        if (event.offsetX + event.currentTarget.offsetLeft + 10 + 100 < m_MaxWidth) {
            //设置位置
            $("#" + self.detail_id).css({
                "top": (event.currentTarget.offsetTop - 5) + "px",
                "left": (event.offsetX + event.currentTarget.offsetLeft + 10) + "px"
            });
        }
        else {
            //设置位置
            $("#" + self.detail_id).css({
                "top": (event.currentTarget.offsetTop - 5) + "px",
                "left": (event.offsetX + event.currentTarget.offsetLeft - 10 - 100) + "px"
            });
        }
    };

    /**
     *根据json中 渐变调色板的内容，解析
     */
    var init_gradient_canvas = function () {
        var canvas = document.getElementById(self.gradient_canvas_id);
        var m_MaxWidth = canvas.width;
        var m_MaxHeight = canvas.height;
        var ctx = canvas.getContext('2d');
        var grd = ctx.createLinearGradient(0, 0, m_MaxWidth, 0);
        //循环添加
        if (gradient_Num > 1) {
            for (var i = 0; i < gradient_Num; i++) {
                var gradient_data_i = gradient_data[i][1];
                var RGB_I = "rgb(" + gradient_data_i[0] + ", " + gradient_data_i[1] + ", " + gradient_data_i[2] + ")";
                grd.addColorStop(1 / (gradient_Num - 1) * i, RGB_I);
            }
        } else {
            var gradient_data_i = gradient_data[0][1];
            var RGB_I = "rgb(" + gradient_data_i[0] + ", " + gradient_data_i[1] + ", " + gradient_data_i[2] + ")";
            grd.addColorStop(0, RGB_I);
            grd.addColorStop(1, RGB_I);
        }
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, m_MaxWidth, m_MaxHeight);
    };

    //初始化阶段列表
    var init_range = function () {
        //计算宽度 使用jquery
        var m_MaxWidth = $("#" + self.target_div_ID).width();
        //固定宽度16 若进度条十分窄，则使用计算的数值 进行初始化
        var m_width = 19;
        if (range_num > 0) {
            if ((m_MaxWidth - 2) / range_num > 0 && (m_MaxWidth - 2) / range_num < m_width) {
                m_width = (m_MaxWidth - 2) / range_num;
            }
        }
        //初始化html开头
        var m_inner = '<div id="Show_Color_plate" style="width: 100%">';
        //根据当前的singleNum 进行显示
        if (range_num > 0) {
            for (var i = 0; i < range_num; i++) {
                var m_range_data_i = range_data[i];
                //获取颜色的数组
                var m_range_data_i_color = m_range_data_i[1];
                //获取颜色rgb格式
                var m_range_data_i_color_rgb = "rgb(" + m_range_data_i_color[0] + "," +
                    m_range_data_i_color[1] + "," + m_range_data_i_color[2] + ")";
                //title处理
                var titlebein = m_range_data_i[0][0];
                var titleend = m_range_data_i[0][1];
                if (titlebein == null) {
                    titlebein = "";
                }
                if (titleend == null) {
                    titleend = "";
                }
                var m_range_data_i_title = titlebein + "~" + titleend;

                m_range_data_i_title.replace("null", "--");
                var m_singleMember = '<div>'
                    + '<canvas style="width: ' + m_width + 'px; height: 22px; float: left; border:0px solid #404040;margin: 2px 0px;'
                    + 'background-color: ' + m_range_data_i_color_rgb + ';"'
                    + 'title="' + m_range_data_i_title + '"'
                    + 'class="range_canvas_' + self.target_div_ID + '"></canvas>'
                    + '</div>';
                m_inner = m_inner + m_singleMember;
            }
        }
        // m_inner = m_inner + '</div>';
        return m_inner;
    };

    //初始化阶段函数列表
    var init_range_func = function () {
        var m_Canvas = document.getElementsByClassName('range_canvas_' + self.target_div_ID);
        for (var i = 0; i < m_Canvas.length; i++) {
            m_Canvas[i].onmouseover = single_canvasMouseOver;
            m_Canvas[i].onmouseout = single_canvasMouseOut;
            m_Canvas[i].onmousemove = single_canvasMouseMove;
        }

    };

    /**
     * 初始化详情 div 返回 html 3种模式共用detail的格式
     * @returns {string}
     */
    var init_detail = function () {
        self.detail_id = self.target_div_ID + "_detail";
        self.detail_canvas_id = self.target_div_ID + "_detail_canvas";
        self.detail_a_id = self.target_div_ID + "_detail_a";
        //详情部分初始化不显示
        var m_inner = ' <!--悬浮显示部分DIV -->'
            + '<div id="' + self.detail_id + '"'
            + 'style="background-color: white; width: 100px;height: 25px; position:absolute; border: 1px solid #7d7d7d;'
            + 'display:none;">'
            + '<canvas style="width: 19px;height: 19px;float: left;background-color: #ffffff;margin: 2px;"'
            + 'id="' + self.detail_canvas_id + '">'
            + '</canvas>'
            + '<p id="' + self.detail_a_id + '"style="height: 25px;line-height: 25px;color:#000000;float:left;"> </p>'
            + '</div>';
        return m_inner;
    };
};


