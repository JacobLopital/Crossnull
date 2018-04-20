(function(){
	var rects = [], // клетки 
		symbs = [], // символы
		comb_array_cross = [], // массив комбинаций крестика
		comb_array_null = [], // массив комбинаций нолика
		current_symb = false, // текущий символ
		amount = 0, // количество к текущей комбинации
		WIN_AMOUNT = 5, // количество для победной комбинации
		WARNING_AMOUNT = 2, // количество символов в комбинации, при которой стоит менять поведение алгоритма
		size = 0, // размер клетки
		side = 0, // размер поля
		OFFSET_VAL = 0.15, // отступ для символа
		OFFSET = 0;
	 
    'use strict';
	//
	//
	//			Model and functions
	//
	//

	function Rect(x, y) { // клетка 
		this.x = x; // свойства положения 
		this.y = y;
		this.draw = function() { // метод рисования
			context.fillStyle = '#000'; // рисование в canvas 
			context.strokeRect(size * this.y, size * this.x, size, size);
		};
	}
	Rect.prototype.constructor = Rect;

	function Symb(x, y, value) { // символ
		var thisSimb = ''; // для того, чтобы реализовать и рисование из куки и рисование кликом, заводим отдельную переменную и её используем для проверки символа 
		this.x = x; // свойства положения и значения
		this.y = y;
		this.value = value;
		this.draw = function() { // метод рисования
			symbSizeY = size * this.y; // положение символа 
			symbSizeX = size * this.x; //
			if (this.value === '') thisSimb = current_symb; // если значение пусто, то для рисования кликом используем текущий символ
			else thisSimb = this.value; // иначе для рисования из куки используем текущее значение
			context.beginPath(); // рисование в canvas 
			if (thisSimb) {
				context.arc(symbSizeY + (size / 2), symbSizeX + (size / 2), size / 2 - OFFSET, 0, Math.PI * 2, false);
			} else {
				context.moveTo(symbSizeY + OFFSET, symbSizeX + OFFSET);
				context.lineTo(symbSizeY + size * (1 - OFFSET_VAL), symbSizeX + size * (1 - OFFSET_VAL));
				context.moveTo(symbSizeY + size * (1 - OFFSET_VAL), symbSizeX + OFFSET);
				context.lineTo(symbSizeY + OFFSET, symbSizeX + size * (1 - OFFSET_VAL));
			}
			context.closePath();
			context.strokeStyle = "#000";
			context.stroke();
			this.value = thisSimb; // записываем в текущее значение из переменной
			current_symb = !current_symb; // меняем текущий символ
			sound('draw'); // проигрываем звук
		};
	}
	Symb.prototype.constructor = Symb;

	function passageSymbs(sym) { // проход поиска символа
		if (sym) comb_array_null = []; // если проход по нолику то обнуляем массив комбинаций нолика
		else comb_array_cross = []; // иначе обнуляем массив комбинаций крестика
		var amountNull = true; // отсутствие символов как таковых
		for (var i = 1; i <= side; i++) { // проход по полю
			for (var j = 1; j <= side; j++) {
				if (symbs[i - 1][j - 1].value === sym) { // если символ подходит
					amount = 1; // начать подсчет количества символов в комбинации
					amountNull = false; // уже что-то есть
					if (circlePass(symbs[i - 1][j - 1].value, i, j)) return true; // запускаем проход вокруг найденного символа
				}
			}
		}
		if (AI && sym && current_symb) { // если ИИ включен, проход по нолику и ход нолика 
			MaxAmountCross = searchMaxAmount(comb_array_cross); // выбираем из массива комбинацию с максимальным значением
			MaxAmountNull = searchMaxAmount(comb_array_null);
			if (MaxAmountCross !== false && MaxAmountNull !== false) { // если и у крестика и у нолика есть подходящая комбинация
				if (MaxAmountNull > MaxAmountCross) { // если максимальная комбинация нолика больше чем крестика
					symbs[comb_array_null[MaxAmountNull][0]][comb_array_null[MaxAmountNull][1]].draw(); // рисуем в координаты возвращенные из функции comb_array_null  для максимальной комбинации
					if (comb_array_null[MaxAmountNull][2] + 1 == WIN_AMOUNT) return true; // если количество победное, возвращаем true 
				} else { // иначе рисуем в координаты возвращенные из функции comb_array_cross
					symbs[comb_array_cross[MaxAmountCross][0]][comb_array_cross[MaxAmountCross][1]].draw();
				}
			} else if (MaxAmountCross !== false && MaxAmountNull === false) { // если только у крестика есть подходящая комбинация
				symbs[comb_array_cross[MaxAmountCross][0]][comb_array_cross[MaxAmountCross][1]].draw(); // рисуем туда нолик, чтобы не дать завершить комбинацию
			} else if (MaxAmountCross === false && MaxAmountNull !== false) { // если только у нолика есть подходящая комбинация
				symbs[comb_array_null[MaxAmountNull][0]][comb_array_null[MaxAmountNull][1]].draw(); // рисуем в координаты возвращенные из функции comb_array_null
				if (comb_array_null[MaxAmountNull][2] + 1 == WIN_AMOUNT) return true; // если количество победное, возвращаем true 
			} else if (MaxAmountCross === false && MaxAmountNull === false) { // если ни у кого нет подходящей комбинации
				var coords = searchEmptyRect(getRandomInt(0, side), getRandomInt(0, side)); // ставим в случайном месте, выбираем случайные координаты на поле и в квадрате вокруг него случайную пустую клетку.
				symbs[coords[0]][coords[1]].draw(); // рисуем туда нолик
			}
		} // если ИИ включен, символы отсутствуют и ход нолика
		if (AI && amountNull && current_symb) { // если ИИ включен, символы отсутствуют и ход нолика
			var coords = searchEmptyRect(getRandomInt(0, side), getRandomInt(0, side)); // ставим в случайном месте, выбираем случайные координаты на поле и в квадрате вокруг него случайную пустую клетку.
			symbs[coords[0]][coords[1]].draw(); // рисуем туда нолик
		}
		return false;
	}

	function circlePass(value, x, y) { // проход по кругу вокруг символа
		var lastAmount = amount; // текущее количество
		for (var i = x; i < x + 2; i++) { // мы проходим начиная со сделующего после текущего символа (потому что предыдущие были просмотрены шагом выше)
			if (i > side) continue;
			for (var j = y - 1; j < y + 2; j++) {
				if (j < 1 || j > side || (i == x && j == y)) continue; // если выходит за края или является текущим, то следующий пропускаем его
				if (symbs[i - 1][j - 1].value === value) { // если символ подходит
					amount = lastAmount; // количество равняется ранее сохраненному (нужно для того, чтобы отличать разные возможные комбинации)
					amount++; // инкременитруем количество
					if (directionPass(symbs[i - 1][j - 1].value, i, j, x, y)) return true; // если проход по направлению говорит true, то возвращаем true 
				}
			}
		}
		if (AI && value && current_symb && amount < 2 && comb_array_null.length == 0) { // если ИИ включен и ход нолика
			var coords = searchEmptyRect(x - 1, y - 1); // находим координаты пустой клетки вокруг символа, выбираем случайные
			if (coords) symbs[coords[0]][coords[1]].draw(); // рисуем нолик
		}
		return false;
	}

	function directionPass(value, x, y, lastX, lastY) { // проход в направлении выбранной комбинации
		i = x + (x - lastX); // выбираем ячейку следующую по направлению
		j = y + (y - lastY);
		var edges = j > 0 && j < side + 1 && i > 0 && i < side + 1; // записываем условие невыхода за границы поля
		if (edges && symbs[i - 1][j - 1].value === value) { // если не вышел за границы и следующий символ принадлежит комбинации
			amount++; // инкрементируем количество
			if (amount == WIN_AMOUNT) return true; // если количество победное, возвращаем true 
			return directionPass(symbs[i - 1][j - 1].value, i, j, x, y); // иначе заходим в рекурсию и ищем по направлению дальше. условие выхода из рекурсии либо появление выигрышной комбинации, либо несоотвествие всем условиям и возврат false
		} else if ((!edges || symbs[i - 1][j - 1].value === !value) && (AI && current_symb)) { // иначе если вышел за границы или следующий символ не принадлежит комбинации и если ИИ и ход нолика
			var firstX = x - (x - lastX) * amount - 1; // находим координаты ячейки перед началом комбинации
			var firstY = y - (y - lastY) * amount - 1;
			if (!value && amount > WARNING_AMOUNT && amount < WIN_AMOUNT && firstX >= 0 && firstX < side && firstY >= 0 && firstY < side && symbs[firstX][firstY].value === '') { // если проход по крестику, количество больше 2 и меньше победного, не выходит за границы и ячейка пуста (пресекаем попытку закончить комбинацию крестиком)
				comb_array_cross[comb_array_cross.length] = [firstX, firstY, amount];
			}
		} else if (edges && symbs[i - 1][j - 1].value === '' && AI && current_symb) { // если не вышел за границы и следующая ячейка пуста и если ИИ и ход нолика
			if (!value && amount > WARNING_AMOUNT && amount < WIN_AMOUNT) { // если проход по крестику, количество больше 2 и меньше победного
				comb_array_cross[comb_array_cross.length] = [i - 1, j - 1, amount];
			} else if (value && amount >= WARNING_AMOUNT && amount < WIN_AMOUNT) { // если проход по нолику
				comb_array_null[comb_array_null.length] = [i - 1, j - 1, amount];
			}
		}
		return false;
	}

	function searchEmptyRect(x, y) {
		//	В массив  pretendents записываем все клетки вокруг (x,y), которые пусты и не за краями поля.
		//	После рандомно выбираем одну из них.
		pretendents = [];
		for (var i = x - 1; i < x + 2; i++) {
			for (var j = y - 1; j < y + 2; j++) {
				if (i < 0 || j < 0 || i > side - 1 || j > side - 1) continue;
				if (symbs[i][j].value === '') pretendents[pretendents.length] = [i, j];
			}
		}
		var results = pretendents[getRandomInt(0, pretendents.length - 1)];
		return results;
	}

	function searchMaxAmount(arr) {
		// находим максимальное значение и возвращаем его id 
		var max = 0;
		var maxId = '';
		for (var i = 0; i < arr.length; i++) {
			if (arr[i][2] > max) {
				max = arr[i][2];
				maxId = i;
			}
		}
		if (max > 1) return maxId;
		else return false;
	}

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}


	function sound(eventName) { // воспроизведение звука
		var audio = new Audio(); // используем объект Audio(), задаем тип
		audio.canPlayType('audio/mp3');
    audio.src = 'http://topazelectro.ru/files/ie/'+eventName+'.mp3'; // по параметру передается название файла согласно событию
		audio.autoplay = true;
	}

	function setCookie(name, value, options) { // функции работы с куки честно взял с https://learn.javascript.ru
		options = options || {};

		var expires = options.expires;

		if (typeof expires == "number" && expires) {
			var d = new Date();
			d.setTime(d.getTime() + expires * 1000);
			expires = options.expires = d;
		}
		if (expires && expires.toUTCString) {
			options.expires = expires.toUTCString();
		}

		value = encodeURIComponent(value);

		var updatedCookie = name + "=" + value;

		for (var propName in options) {
			updatedCookie += "; " + propName;
			var propValue = options[propName];
			if (propValue !== true) {
				updatedCookie += "=" + propValue;
			}
		}

		document.cookie = updatedCookie;
	}


	function isStorage() {
		if (localStorage.getItem('size') && localStorage.getItem('side') && localStorage.getItem('symbs')) return true;
		else return false;
	}


	function reloadPlane() { // изменение поля
		if (isStorage()) { // если есть куки, то берем значение из них
			size = parseInt(localStorage.getItem('size')); // размеры и ИИ
			side = parseInt(localStorage.getItem('side'));
			AI = !! localStorage.getItem('AI'); // 
			current_symb = localStorage.getItem('current_symb'); // 
			var symbsCookie = JSON.parse(localStorage.getItem('symbs')); // значения символов  в клетках
			$("#sizeRect").val(size); // так же меняем значения в бегунках
			$("#hor").val(side);
			canvas.onclick = canvasClick; // назначаем функцию на событие
		} else {
			size = parseInt($("#sizeRect").val()); // иначе записываем размеры в глобальные  переменные из инпутов
			side = parseInt($("#hor").val());
			AI = document.getElementById("AI").checked;
			$('#sideValue').text(side); // записываем в индикацию
			$('#sizeValue').text(size);
			canvas.onclick = function() {};
		}
		rects = []; // создаем массивы клеток, и если есть куки, то массив с символами
		symbs = [];
		for (var i = 0; i < side; i++) {
			rects[i] = [];
			symbs[i] = [];
			for (var j = 0; j < side; j++) {
				rects[i][j] = new Rect(i, j);
				if (isStorage()) symbs[i][j] = new Symb(i, j, symbsCookie[i][j].value); // так как мы не можем передать функции через JSON, значения символов из куки передаем через отдельный массив, по размерам равный нужному
				else symbs[i][j] = new Symb(i, j, '');
			}
		}
		drawPole(); // рисуем поле
	}
	
	//
	//
	//			Views
	//
	//



	function drawPole() {
		current_symb = false; // первый ходит крестик
		canvas = document.getElementById("canvas"); // создаем канвас
		canvas.onclick = canvasClick; // назначаем функцию на событие
		canvas.width = size * side; // вычисляем высоту и ширину
		canvas.height = size * side;
		poleResize();
		context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		if (canvas.getContext) { // рисуем поле
			for (var i = 0; i < side; i++) {
				for (var j = 0; j < side; j++) {
					rects[i][j].draw();
					if (isStorage() && symbs[i][j].value !== '') symbs[i][j].draw(); // если есть куки и значение у текущего символа, то рисуем это значение в клетку
				}
			}
		}
	}

	function poleResize() {
		canvas = document.getElementById("canvas"); // берем канвас
		canvas.style.top = window.innerHeight / 2 - size * side / 2 + 'px';
		canvas.style.left = window.innerWidth / 2 - size * side / 2 + 'px';
		controllers.style.top = window.innerHeight / 2 - 200 + 'px';
		controllers.style.height = window.innerHeight - 300 + 'px';
		settingsDiv.style.height = window.innerHeight;
		canvasDiv.style.height = window.innerHeight;
	}


	function congratulations(symbol) {
		// показываем текст, вставляем переданный символ и проигрываем музыку
		canvas.onclick = function() {};
		cong.style.top = '10%';
		$('#cong').text('Выиграл ' + symbol + '!');
		sound('congratulations');
	}
		
	//
	//
	//			Controllers
	//
	//
	

	function canvasClick() { // обрабатываем клики мышью
		leftPosisiton = Math.floor((event.pageX - this.offsetLeft) / size); // высчитываем координаты щелчка относительно поля измеряя растояние размером клетки
		topPosisiton = Math.floor((event.pageY - this.offsetTop) / size);
		if (symbs[topPosisiton][leftPosisiton] && symbs[topPosisiton][leftPosisiton].value === '') { // если клетка не занята, то рисуем туда 
			symbs[topPosisiton][leftPosisiton].draw();
		}
		if (passageSymbs(false)) { // если проход по символам выдал false (значение крестика)
			congratulations('крестик'); // поздравляем крестик
		} else if (passageSymbs(true)) { // иначе если проход по символам выдал true  (значение нолика)
			congratulations('нолик'); // поздравляем нолик
		}
		localStorage.setItem('symbs',JSON.stringify(symbs)); // записываем в куки значения символов
		localStorage.setItem('current_symb',current_symb); // записываем в куки значения символов
	}
	window.addEventListener("load", function(){
		
		// заполняем глобальные переменные
		size = parseInt(document.getElementById("sizeRect").value); // размер клетки
		side = parseInt(document.getElementById("hor").value); // размер поля
		OFFSET = size * OFFSET_VAL;
		
		reloadPlane();
		
		setTimeout(function() {
			//	в самом начале если есть куки показываем заголовок (1 сек) и убираем его,
			// 	экран настроек не показываем. выводим кнопку перезагрузки и новой игры
			//	иначе после заголовка показываем стартовый экран
			if (isStorage()) {
				title.style.fontSize = '50pt';
				title.style.top = '-100%';
				reload.style.top = '0px';
				newGame.style.top = '0px';
			} else {
				$('#settingsDiv').fadeToggle(500);
				title.style.fontSize = '50pt';
				title.style.top = '8%';
			}
		}, 1000);
		
		// навешивает на все теги с классом input (те которые меняют размер поля) слушатель, изменяющий размер поля
		$('.input').bind('input', function() {
			reloadPlane();
		});
		document.getElementById('AI').addEventListener('change', function() {
			reloadPlane();
		});
		document.getElementById('start').addEventListener('click', function() { // обработка нажатия на кнопу "Старт"
			reloadPlane(); // обновляем поле
			$('#settingsDiv').fadeOut(400); // убираем первый экран и заголовок, показываем кнопку перезагрузки и новой игры
			title.style.top = '-100%';
			reload.style.top = '0';
			newGame.style.top = '0px';
			localStorage.setItem('size',JSON.stringify(size)); // записываем в куки значения размеров и ИИ
			localStorage.setItem('side',JSON.stringify(side));
			localStorage.setItem('current_symb',current_symb);
			if (AI) localStorage.setItem('AI',JSON.stringify(AI));
			else localStorage.setItem('AI','');
			sound('start'); // проигрываем звук 
		});

		document.getElementById('newGame').addEventListener('click', function() { // обработка нажатия на кнопу "Новая игра"
			localStorage.removeItem('size'); // удаляем куки
			localStorage.removeItem('side');
			localStorage.removeItem('symbs');
			localStorage.removeItem('AI');
			reloadPlane(); // обновляем поле
			$('#settingsDiv').fadeToggle(500); // показываем первый экран и заголовок, убираем кнопки перезагрузки и новой игры
			title.style.fontSize = '50pt';
			title.style.top = '8%';
			newGame.style.top = '-100px';
			reload.style.top = '-100%';
			cong.style.top = '-100%';
		});
		document.getElementById('reload').addEventListener('click', function() { // обработка нажатия на кнопку перезагрузки
			localStorage.removeItem('size'); // удаляем куки
			localStorage.removeItem('side');
			localStorage.removeItem('symbs');
			localStorage.removeItem('AI');
			localStorage.removeItem('current_symb');
			reloadPlane(); // обновляем поле
			current_symb=false;
			localStorage.setItem('current_symb',current_symb); // Добавляем обратно куки
			localStorage.setItem('symbs',''); // Добавляем обратно куки
			localStorage.setItem('size',JSON.stringify(size));
			localStorage.setItem('side',JSON.stringify(side));
			if (AI) localStorage.setItem('AI',JSON.stringify(AI));
			title.style.top = '-100%'; // убираем заголовки
			cong.style.top = '-100%';
			reload.style.opacity = '0.1'; // "подмигиваем" кнопкой
			setTimeout(function() {
				reload.style.opacity = '1';
			}, 200);
			sound('reload'); // проигрываем звук 
		});
		window.addEventListener('resize',function() {
			poleResize();
		});
	});

	

})();