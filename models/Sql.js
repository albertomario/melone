var Sql = {
	create: {
		key: 'CREATE TEMPORARY TABLE IF NOT EXISTS {{key}} (' +
				'`id` int(11) NOT NULL AUTO_INCREMENT, ' +
				'`key` varchar(32) NOT NULL, ' +
				'`secret` varchar(32) NOT NULL, ' +
				'`created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
				'PRIMARY KEY (`id`) ' +
			') ENGINE=MEMORY DEFAULT CHARSET=utf8;'
	},

	remove: {
		key: 'DROP TEMPORARY TABLE IF EXISTS {{key}}'
	}
};

module.exports = Sql;