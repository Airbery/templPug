<?php
//if(!strpos($_SERVER[HTTP_REFERER], $_SERVER[SERVER_NAME])!==FALSE) die("Возникли проблемы при отправке данных.");

$arr_mail=array("terribo@yandex.ru");
$result = array(
	"message" => "Спасибо за обращение. Ваша заявка принята. Мы свяжемся с вами в течение ближайшего времени.",
	"error" => "",
	"defectmail" =>""
);
/*
$result_send_mail = "";
$errmes = "";
*/
$add_values=array();

if(empty($_POST['vname'])||empty($_POST['vphone'])) {
	$result["message"] = "Заполните поля формы, пожалуйста.";
} else {

	function dataprotect($txt_obj) {
		$str_from = array("'", '"');
		$str_to = array('&#039', '&quot');
		return str_replace($str_from, $str_to,  $txt_obj);
	}

	//vname,vphone,vmail
	foreach($_POST as $k=>$v) {
		$add_values[$k]=dataprotect($v);
	}

	/*Заголовок*/
	$headmail="Заявка с ".$_SERVER['SERVER_NAME'];
	$headmail='=?UTF-8?B?'.base64_encode($headmail).'?=';
	/*Заголовок*/

	/*Текст*/
	$textmail=
	"Новая заявка.
	Имя: ".$add_values['vname']."
	Телефон: ".$add_values['vphone']."
	E-mail: ".$add_values['vmail'];

	$zone=+3;
	$time_gr_msk=gmmktime(gmdate("H i s m j Y"))+($zone*3600);
	$textmail.="\nДата(мск): ".gmdate("d.m.Y H:i",$time_gr_msk);
	/*Текст*/

	/*Доп_заголовок*/
	$from='=?UTF-8?B?'.base64_encode("Администратор").'?=';
	$headers= "MIME-Version: 1.0\r\n";
	$headers .= "Content-type: text/plain; charset=utf-8\r\n";
	$headers .= "From: ".$from." <administrator@".$_SERVER['SERVER_NAME'].">\r\n";
	/*Доп_заголовок*/


	foreach($arr_mail as $v) {
		$send_mail = mail($v, $headmail, $textmail, $headers);
		if(!$send_mail) $result["defectmail"] .= "Не отправлен ".$v;
	}
}
echo json_encode($result);

?>