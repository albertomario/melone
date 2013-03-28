$(function() {
	if ($('#chart-sent').length) {
		$.getJSON('/data/mail', function(data) {
			if (data) {
				console.log(data);
				$('#chart-sent').highcharts({
					chart: {
						type: 'line',
						zoomType: 'x'
					},
					title: {
						text: null
					},
					xAxis: {
						allowDecimals: false,
						type: 'datetime',
						maxZoom: 7 * 24 * 3600000,
						dateTimeLabelFormats: {
							day: '%e. %b'
						}
					},
					yAxis: {
						title: {
							text: null
						}
					},
					series: data
				});
			} else {
				console.log('Could not get data from "/data/mail"');
				console.log('data');
			}
		});
	}

	if ($('textarea[name="html"]').length) {
		CKEDITOR.replace($('textarea[name="html"]').attr('name'));
	}
});