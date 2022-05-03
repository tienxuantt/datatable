
// Các hàm dùng chung toàn chương trình
var CommonFn = CommonFn || {};

// Hàm format số tiền
CommonFn.formatMoney = money => {
    if(money && !isNaN(money)){
        return money.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1.");
    }else{
        return money;
    }
}

// Format ngày tháng
CommonFn.formatDate = dateSrc => {
    let date = new Date(dateSrc),
        year = date.getFullYear().toString(),
        month = (date.getMonth() + 1).toString().padStart(2, '0'),
        day = date.getDate().toString().padStart(2, '0');

    return `${day}/${month}/${year}`;
}

// Format ngày tháng
CommonFn.convertDate = dateSrc => {
    let date = new Date(dateSrc),
        year = date.getFullYear().toString(),
        month = (date.getMonth() + 1).toString().padStart(2, '0'),
        day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Lấy giá trị của một enum
CommonFn.getValueEnum = (data, enumName) => {
    let enumeration = Enumeration[enumName],
        resource = Resource[enumName];

    for(prop in enumeration){
        if(enumeration[prop] == data){
            data = resource[prop];
        }
    }
    
    return data;
}

// Kiểm tra xem có phải dạng date không
CommonFn.isDateFormat = (date) => {
    let regex = new RegExp("([0-9]{4}[-](0[1-9]|1[0-2])[-]([0-2]{1}[0-9]{1}|3[0-1]{1})|([0-2]{1}[0-9]{1}|3[0-1]{1})[-](0[1-9]|1[0-2])[-][0-9]{4})");
    
    return regex.test(date);
}