<?php
	session_start();
	if (isset($_GET)){
		if ($_GET['user']=='list'){
			$str = 'SELECT  DISTINCT user_id FROM user';
		} else if ($_GET['user']=='sessions' && $_GET['user_id']){
			$str = 'SELECT  DISTINCT session_id FROM user_action WHERE user_id="'.$_GET["user_id"].'"';
		} else if ($_GET['user']=='actions' && $_GET['user_id']){
			$str = 'SELECT * FROM user_action WHERE user_id="'.$_GET["user_id"].'"';
		} else if ($_GET['session']){
			$str = 'SELECT * FROM user_action WHERE session_id ="'.$_GET['session'].'"';
		} else if ($_GET['user_session']){
			$str = 'SELECT * FROM user WHERE session_id ="'.$_GET['user_session'].'"';
		} else if ($_GET['user_articles']){
			$str = 'SELECT data, action, client_time FROM user_action WHERE user_id="'.$_GET['user_articles'].'" AND action="open_article"';
		}
		
		if ($str){
			$arr = query($str);
			echo json_encode($arr);
		}
	}



	if (isset($_POST)){		
		if (isset($_POST['userdata'])){

			$d = $_POST['userdata'];

			$str = 'INSERT INTO user (user_id,session_id,start_time,window_x,window_y,screen_x,screen_y,media,type,vendor) VALUES( '
						.'\''.$d['user_id'].'\', '
						.'\''.$d['session_id'].'\', '
						.$d['start_time'].', '
						.$d['window'][0].', '
						.$d['window'][1].', '
						.$d['screen'][0].', '
						.$d['screen'][1].', '
						.'\''.$d['media'].'\', '
						.'\''.$d['type'].'\', '
						.'\''.$d['vendor'].'\''
						.' )';

			save($str);


		} else if (isset($_POST['data'])){
			$d = $_POST['data'];
			
			$str = 'INSERT INTO user_action (user_id,session_id,client_time,action,event_type,data) VALUES( '						
						.'\''.$d['user_id'].'\', '
						.'\''.$d['session_id'].'\', '
						.$d['time'].', '
						.'\''.$d['action'].'\', '
						.'\''.$d['event_type'].'\', '
						.'\''.$d['data'].'\''
						.' )';
			
			
			save($str);
		}

	}

	function query($str){
		try{
			$p = new PDO("mysql:host=localhost;dbname=rupu_usertracker","mato","sukkamato");
		} catch (PDOException $e){
			die( '{ok:false,message:"pdo init error"}' );
		}

		$p->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION, PDO::FETCH_ASSOC);
		
		
		$q = $p->prepare($str);
		$q->execute();
		$rep = array();

		while ($result = $q->fetch(PDO::FETCH_ASSOC)){
			$rep[] = $result;
		}


		return $rep;
	}
	
	function save($data){
		try{
			$p = new PDO("mysql:host=localhost;dbname=rupu_usertracker","mato","sukkamato");
		} catch (PDOException $e){
			die( '{ok:false,message:"pdo init error"}' );
		}

		$p->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		
		try{
			$result = $p->prepare($data);
			$result->execute();

			echo json_encode(array('ok'=>true));
		} catch (PDOException $e){
			echo json_encode(array('ok'=>false,'message'=>$e->getMessage()));
		}
	}

?>