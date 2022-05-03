// Class tạo mới table
class DataTable{

    // Hàm khởi tạo mặc định
    constructor(tableId, options){
        let me = this;

        // Thiết lập các thuộc tính cho table
        me.setOptions(tableId, options);
        // Khởi tạo các sự kiện
        me.initEvents();

        // Thực hiện lấy dữ liệu table
        me.getDataTable();
    }

    // Thiết lập các thuộc tính table
    setOptions(tableId, options){
        let me = this;

         // Gán datatable
         me.datatable = $(`#${tableId}`);
         // Lưu lại các option
         me.options = Object.assign({}, options);
         // Lấy các cột
         me.colums = me.getColumnOptions();
         // Các bản ghi
         me.items = [];
         // Dữ liệu summary
         me.summaryData = {};
    }

    // Lấy các cột
    getColumnOptions(){
        let me = this,
            datatable = me.datatable,
            columns = [],
            totalWidth = 0,
            summary = false,
            columnOption = {
                type: 'String',
                field: null,
                width: 150,
                enum: null,
                class: null,
                index: null,
                summary: false,
                text: ''
            };

        // Duyệt từng cột để lấy cấu hình
        datatable.find(".table-column").each(function(index){
            let column = {...columnOption};

            // Lưu lại thứ tự và text cột
            column.index = index + 1;
            column.text = $(this).text();
            
            for(var propName in columnOption){
                let value = $(this).attr(`data-${propName}`);

                if(value){
                    column[propName] = value;
                }
            }

            // Tính tổng width
            totalWidth += parseInt(column.width);
            summary = column.summary || summary;

            columns.push(column);
        });

        // Lưu lại tổng độ dài
        me.totalWidth = totalWidth;
        me.options.summary = summary;

        return columns;
    }

    // Vẽ table
    drawTable(){
        let me = this,
            tableWrapper = $(`<div class="table-content"></div>`);

        // Nếu chưa có khung thì append khung table
        if(me.datatable.find(".table-content").length == 0){
            me.datatable.empty();
            me.datatable.append(tableWrapper);
        }

        // Nếu chưa có header thì vẽ header
        if(!me.header){
            me.drawHeaderTable();
        }

        // Thực hiện vẽ phần body
        me.drawBodyTable();

        // Thực hiện vẽ dòng summary
        if(me.options.summary){
            me.drawSummaryTable();
        }

        // Nếu chưa có paging thì vẽ
        if(!me.paging && me.options.paging){
            me.drawPagingTable();
        }

        // Thực hiện sau khi vẽ xong table
        me.afterDraw();
    }

    // Vẽ header table
    drawHeaderTable(){
        let me = this,
            headerWrapper = $(`<div class="table-content_header"></div>`),
            headerRow = $(`<div class="header-row"></div>`);

        // Nếu chưa có phần binding header thì thêm thẻ bao
        if(me.datatable.find(".table-content_header").length == 0){
            me.datatable.find(".table-content").append(headerWrapper);
        }else{
            me.datatable.find(".table-content_header").empty();
        }

        // Xóa nội dung
        if(me.colums && me.colums.length > 0){
            // Duyệt từng header để vẽ
            me.colums.filter(function(item, index){
                let headerItem = $(`<div class="header-item"></div>`),
                    classStyle = me.getClassCell(item);

                headerItem.text(item.text);
                headerItem.addClass(classStyle);
                headerItem.width(item.width);
                headerItem.attr("column-index", index + 1);
                headerItem.attr("title", item.text);

                headerRow.append(headerItem);
            });

            // Thực hiện append row vừa vẽ
            me.datatable.find(".table-content_header").append(headerRow);

            // Lưu lại row vừa vẽ
            me.header = headerRow;
        }
    }

    // Thực hiện vẽ phần body
    drawBodyTable(){
        let me = this,
            items = me.items,
            bodyWapper = $(`<div class="table-content_body"></div>`);

        // Nếu có phần wrapper rồi thì k vẽ nữa
        if(me.datatable.find('.table-content_body').length == 0){
            me.datatable.find(".table-content").append(bodyWapper);
        }else{
            me.datatable.find(".table-content_body").empty();
        }

        // Thực hiện vẽ phần body
        if(items && items.length > 0){
            items.filter(function(item, index){
                let rowItem = $(`<div class="row-item"></div>`);

                rowItem.attr("row-index", index + 1);

                // Duyệt từng column để binding cell
                me.colums.filter(function(column, indexColumn){
                    let cell = $(`<div class="cell-item"></div>`),
                        classStyle = me.getClassCell(column),
                        value = me.getValueCell(item, column);

                    cell.attr("column-index", indexColumn + 1);
                    cell.addClass(classStyle);
                    cell.text(value);
                    cell.width(column.width);
                    cell.attr("title", value);

                    rowItem.append(cell);
                });

                // Thực hiện append row vừa vẽ
                me.datatable.find(".table-content_body").append(rowItem);
            });
        }
    }

    // Thực hiện vẽ summary
    drawSummaryTable(){
        let me = this,
            summaryWrapper = $(`<div class="table-content_summary"></div>`);

         // Nếu chưa có phần binding summary thì thêm thẻ bao
         if(me.datatable.find(".table-content_summary").length == 0){
            me.datatable.find(".table-content").append(summaryWrapper);
        }else{
            me.datatable.find(".table-content_summary").empty();
        }

        // Thực hiện binding summary
        if(me.summaryData){
            me.colums.filter(function(item, indexColumn){
                let summaryItem = $("<div class='summary-item'></div>");

                summaryItem.attr("column-index", indexColumn + 1);
                summaryItem.addClass("align-right");
                summaryItem.width(item.width);

                if(item.summary){
                    let value = me.getValueCell(me.summaryData, item);

                    summaryItem.attr("title", value);
                    summaryItem.text(value);
                }

                me.datatable.find(".table-content_summary").append(summaryItem);
            });
        }
    }

    // Thực hiện vẽ paging table
    drawPagingTable(){
        let me = this,
            paging = $(`<div class="table-paging"></div>`);

        // Thực hiện append dòng paging
        me.datatable.append(paging);

        // Lưu lại paging
        me.paging = paging;
    }

    // Lấy class cho cell
    getClassCell(column){
        let me = this,
            className = column.class || '';

        switch(column.type){
            case 'Number':
            case 'Currency':
                className += ' align-right ';
                break;
            case 'Date':
                className += ' align-center';
                break;
        }

        return className;
    }

    // Lấy giá trị ô
    getValueCell(data, column){
        let me = this,
            value = data[column.field] || '';

        switch(column.type){
            case 'Number':
            case 'Currency':
                value = CommonFn.formatMoney(value);
                break;
            case 'Date':
                value = CommonFn.formatDate(value);
                break;
        }

        return value;
    }

    // Hàm lấy dữ liệu
    getDataTable(){
        let me = this;

        me.items = ListEmployee;
        me.summaryData = summaryData;

        // Thực hiện vẽ table
        me.drawTable();
    }

    // Khởi tạo các sự kiện
    initEvents(){
        let me = this;

        // Khởi tạo các sự kiện liên quan tới style
        me.initEventsStyle();

        // Khởi tạo các sự kiên liên quan nghiệp vụ 
        me.initEventsBussiness();
    }

    // Khởi tạo các sự kiện liên quan style
    initEventsStyle(){
        let me = this,
            datatable = me.datatable;

        // Khởi tạo sự kiện khi click dòng
        datatable.off("click").on("click", ".row-item", function() {
             // Bỏ chọn các dòng đang được chọn
            datatable.find(".selected-row").removeClass("selected-row");

            // Set active dòng hiện tại
            $(this).addClass("selected-row");
        });
    }

    // Khởi tạo sự kiện liên quan nghiệp vụ
    initEventsBussiness(){
        let me = this,
            datatable = me.datatable;

    }

    // Khởi tạo một số sự kiện sau khi draw xong
    initEventsAfterDraw(){
       
    }
    
    // Thực hiện vẽ table
    draw(data, funCallBack){

    }

    // Xử lý sau khi draw xong
    afterDraw(){
        let me = this;

        // Vẽ thanh scrollBar
        me.initScrollBar();

        // Thiết lập width cho table
        me.setWidthLayout();
    }

    // Khởi tạo scroll Bar
    initScrollBar(){
        let me = this;

        // Vẽ scrollBar
        me.drawScrollBar();

        // Khởi tạo sự kiện 
        me.initEventsScrollBar();
    }

    // Thiết lập width cho layout
    setWidthLayout(){
        let me = this;

        me.datatable.find(".header-row, .table-content_header, .table-content_summary, .table-content_body").width(me.totalWidth);
    }

    // Vẽ thanh scrollBar
    drawScrollBar(){
        let me = this,
            datatable = me.datatable,
            totalRecord = me.items.length,
            heightRow = datatable.find(".row-item:first").height(),
            heightHeader = datatable.find(".table-content_header").height(),
            heightBody = datatable.find(".table-content_body").height(),
            scrollBar = $(`<div class="scroll-bar-y"><div class="scroll-bar-content"></div></div>`);

        datatable.find(".scroll-bar-y").remove();
        datatable.append(scrollBar);
        datatable.find(".scroll-bar-y").css({"top": heightHeader, "height": `${heightBody}px`});
        datatable.find(".scroll-bar-content").height(totalRecord * heightRow);
    }

    // Khởi tạo sự kiện sau khi vẽ scroll
    initEventsScrollBar(){
        let me = this,
            classBody = ".table-content_body",
            classScrollBar = ".scroll-bar-y",
            datatable = me.datatable;

        // Khởi tạo sự kiện khi scroll nội dung thì thanh scroll cuộn theo
        datatable.find(`${classBody}, ${classScrollBar}`).scroll(function(){
            if(!me.scrollFocus){
                let scrollBodyTop = datatable.find(classBody).scrollTop(),
                    scrollBarTop = datatable.find(classScrollBar).scrollTop();

                if(scrollBodyTop != scrollBarTop){
                    me.scrollFocus = true;

                    if($(this).hasClass("scroll-bar-y")){
                        datatable.find(classBody).scrollTop(scrollBarTop);
                    }else{
                        datatable.find(classScrollBar).scrollTop(scrollBodyTop);
                    }

                    setTimeout(function(){
                        me.scrollFocus = null;
                    }, 0);
                }
            }
        });
    }
}

var options = {
    paging: true
};

// Tao moi mot instance
var datatable = new DataTable("gridEmployee", options);