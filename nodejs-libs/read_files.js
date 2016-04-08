module.exports = function(file_names, callback){
    var data_in_files = [];
    var read_flag_of_files = [];

    var files_read_over = function(){
        if(read_flag_of_files.every((flag)=>{return flag;})) {
            callback(data_in_files);
        }
    };
    
    file_names.forEach((file_name, file_id)=>{
        data_in_files.push([]);
        read_flag_of_files.push(false);
        
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(file_name)
        });
        
        lineReader.on('line', function (line) {
            if (line != "") {
                data_in_files[file_id].push(line);
            };
        });
        
        lineReader.on('close', function(){
            console.error(file_name + " read over");
            read_flag_of_files[file_id] = true;
            files_read_over();
        });   
    });
}