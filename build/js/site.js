$(document).ready(function(){
    //Запрет переносов по странице ссылок и картинок
    $("img,a").on("dragstart", function(event){ event.preventDefault();});

    // МОДАЛЬНОЕ ОКНО
    function open_modal(modalType) {
        modalType = modalType || ".modal-type-standart";
        $(".modal-bg," + modalType).css({"display":"block"});
    }
    function clearform(clearblock) {
        $(clearblock).find("input[type='text'], textarea").val("");
        $(clearblock).find("input[type='checkbox'], input[type='radio'] ").prop({"checked":false});
    }

    $(".modal-open").click(function() {
        // sendModal = $(this).attr("data-mod");
        $(".result-form").html("");
        $(".modal-form").css({"display":"block"});
        $(".modal-bg").fadeIn(100);
        open_modal();
        return false;
    });
    $(".modal-close, .modal-bg").click(function () {
        $(".modal-bg, .modal-window").hide();
        $("body").css({"overflow":"auto"});
        clearform(".modal-window form");
    });
    // \ МОДАЛЬНОЕ ОКНО


    // ОБРАБОТЧИК ФОРМЫ
    $("form").submit(function(){
        var sendsform = $(this);
        $(".result-form").css({"display":"block"}).html("<progress value='50' max='100'></progress>");
        $(".modal-form").css({"display":"none"});

        $.ajax({
            url: "sendmail.php",
            type: "POST",
            data: $(this).serialize(),
            dataType: "json",
            success: function(result) {
                var userMessage = (result.error=="")?result.message:result.error;
                $(".result-form").html(userMessage);
                $(".modal-bg").fadeIn(100);
                open_modal();
                $(".modal-window").fadeOut(6000);
                setTimeout(function() {$(".modal-bg").hide();}, 5500);
                clearform(sendsform);
            },
            error: function(jqXHR) {
                open_modal();
                $(".result-form").html(jqXHR.responseText);
                if(jqXHR.responseText) {
                    $(".result-form").html("Сожалеем, возникли проблемы при отправке данных.");
                }
            }
        });
        return false;
    });
    // \ ОБРАБОТЧИК ФОРМЫ
});