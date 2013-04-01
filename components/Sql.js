var Sql = {
	create: {
		key: 'CREATE TEMPORARY TABLE IF NOT EXISTS {{key}} (' +
				'`id` int(11) NOT NULL AUTO_INCREMENT, ' +
				'`key` varchar(32) NOT NULL, ' +
				'`secret` varchar(32) NOT NULL, ' +
				'`created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
				'PRIMARY KEY (`id`) ' +
			') ENGINE=MEMORY DEFAULT CHARSET=utf8;',
		tag: 'CREATE TEMPORARY TABLE IF NOT EXISTS {{tag}} (' +
				'`id` int(10) unsigned NOT NULL AUTO_INCREMENT, ' +
				'`name` varchar(50) NOT NULL, ' +
				'`description` varchar(255) NOT NULL, ' +
				'`created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
				'PRIMARY KEY (`id`) ' +
			') ENGINE=MEMORY DEFAULT CHARSET=utf8;'
	},

	remove: {
		key: 'DROP TEMPORARY TABLE IF EXISTS {{key}}',
		tag: 'DROP TEMPORARY TABLE IF EXISTS {{tag}}'
	}
};

module.exports = Sql;