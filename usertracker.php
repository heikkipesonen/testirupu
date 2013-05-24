<?php
	session_start();
	$users = array(
		'jolu'=>'paiva1',
		'koe3'=>'paiva1',
		'heer'=>'paiva2',
		'maki'=>'paiva2',
		'koe2'=>'paiva2'
	);

	function checkLogin($username){
		$_SESSION['login']= true;
		$_SESSION['user'] = $_POST['login'];
		$_SESSION['user_id'] = $_POST['login'];		
		$_SESSION['session_id'] = session_id();
		return true;
	}

	function login(){
		if ($_POST['userdata']){		
			$d = $_POST['userdata'];

			$str = 'INSERT INTO user (user_id,session_id,start_time,window_x,window_y,screen_x,screen_y,media,type,vendor,latitude,longitude,ip) VALUES( '
						.'\''.$_SESSION['user'].'\', '
						.'\''.session_id().'\', '
						.$d['start_time'].', '
						.$d['window'][0].', '
						.$d['window'][1].', '
						.$d['screen'][0].', '
						.$d['screen'][1].', '
						.'\''.$d['media'].'\', '
						.'\''.$d['type'].'\', '
						.'\''.$d['vendor'].'\', '
						.$d['latitude'].', '
						.$d['longitude'].', '
						.'\''.$_SERVER['REMOTE_ADDR'].'\''
						.')';


		 	echo save($str);
		}
	}


	if (isset($_POST)){	
		if (isset($_POST['chklogin'])){
			if ($_SESSION['login']){
				echo json_encode(array('ok'=>true,'data'=>$_SESSION));
			} else 	{
				echo json_encode(array('ok'=>false));
			}
		}

		if (isset($_POST['login'])){			
			if (checkLogin($_POST['login'])){					
				login();
			} else {
				echo json_encode(array('ok'=>false));
			}
		}




		if (isset($_POST['data']) && $_SESSION['login']==true){
			$d = $_POST['data'];
			
			$str = 'INSERT INTO user_action (user_id,session_id,client_time,action,event_type,data) VALUES( '
						.'\''.$_SESSION['user'].'\', '
						.'\''.session_id().'\', '
						.$d['time'].', '
						.'\''.$d['action'].'\', '
						.'\''.$d['event_type'].'\', '
						.'\''.$d['data'].'\''
						.' )';			
			
			echo save($str);

		} else if (isset($_POST['data']) && $_SESSION['login']==false){
			echo json_encode(array('ok'=>false));
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

			return json_encode(array('ok'=>true));
		} catch (PDOException $e){
			return json_encode(array('ok'=>false,'message'=>$e->getMessage()));
		}
	}

?>