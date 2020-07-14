<?php

	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\Exception;

	require 'libs/PHPMailer/src/Exception.php';
	require 'libs/PHPMailer/src/PHPMailer.php';

	$result = array(
		"message" => "Спасибо за обращение. Ваша заявка принята. Мы свяжемся с вами в течение ближайшего времени.",
		"error" => "",
		"defectmail" =>"",
	);

	if(empty($_POST['vname'])||empty($_POST['vphone'])) {
		$result["message"] = "Заполните поля формы, пожалуйста.";
	} else {
		$mail = new PHPMailer(true);


		$mail->addAddress("joe@example.net", "ClientFromSite");
		$mail->CharSet = "UTF-8";
		$mail->isHTML(true);
		$mail->Subject = "Заявка с ".$_SERVER['HTTP_HOST'];
	    $mail->setFrom("administrator@".$_SERVER['HTTP_HOST'], "Administrator");
	    $mail->addReplyTo("administrator@".$_SERVER['HTTP_HOST'], "Administrator");
	    
		function dataprotect($txt_obj) {
			$str_from = array("'", '"');
			$str_to = array('&#039', '&quot');
			return str_replace($str_from, $str_to,  $txt_obj);
		}

		//vname,vphone,vmail
		foreach($_POST as $k=>$v) {
			$add_values[$k]=dataprotect($v);
		}

		//Текст
		$mail->Body    =
		"Новая заявка.
		Имя: ".$add_values['vname']."
		Телефон: ".$add_values['vphone']."
		E-mail: ".$add_values['vmail'];

		if($mail->send()) echo json_encode($result);
	}

?>