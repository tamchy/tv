#-*- coding: utf-8 -*-
from django.db import models

channels_category=(('News','Новостные Каналы'),('Kids','Детские Каналы'),('Ent','Развлекательные Каналы'),('Edu','Познавательные Каналы'),('Sport','Спортивные Каналы'),('Music','Музыкальные Каналы'),('Common','Общие Каналы'),('Film','Фильмовые Каналы'),('Test','Тестовые Каналы'),('Kyr','Кыргызстанские каналы'))
ch_list=[('635', u'1+1 \u043c\u0435\u0436\u0434\u0443\u043d\u0430\u0440\u043e\u0434\u043d\u044b\u0439'), ('300046', u'2+2 (\u043a\u0438\u043d\u043e)'), ('100023', u'24 \u0414\u041e\u041a'), ('300018', u'24 \u0422\u0435\u0445\u043d\u043e'), ('561', u'31 \u043a\u0430\u043d\u0430\u043b'),
		 ('1499', u'34 \u0442\u0435\u043b\u0435\u043a\u0430\u043d\u0430\u043b'), ('556', u'365 \u0414\u043d\u0435\u0439'), ('366', u'41 \u043a\u0430\u043d\u0430\u043b (\u0414\u043e\u043c\u0430\u0448\u043d\u0438\u0439)'), ('300058', u'5 \u043a\u0430\u043d\u0430\u043b (\u0423\u043a\u0440\u0430\u0438\u043d\u0430)'),
		 ('1531', '7NEWS'), ('946', u'8 \u041a\u0430\u043d\u0430\u043b'), ('300075', u'8 \u043a\u0430\u043d\u0430\u043b (\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u044c)'), ('1454', u'9 \u0412\u043e\u043b\u043d\u0430'), ('278', u'9 \u041e\u0440\u0431\u0438\u0442\u0430'), ('503', 'A-ONE'), ('258', 'AB Moteurs'), 
		 ('1566', 'AMEDIA'), ('300001', 'AXN Sci-fi'), ('277', 'AjaraTV'), ('227', u'Amazing Life (\u0423\u0434\u0438\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u0436\u0438\u0437\u043d\u044c)'), ('214', 'Animal Planet'), ('948', 'Animal Planet Europe'), ('300107', 'Animal Planet HD'), ('300098', 'Arirang TV'), 
		 ('219', 'BBC World'), ('300027', 'Baby TV'), ('220', 'Bloomberg'), ('300037', 'Bridge TV'), ('100073', u'Business (\u0423\u043a\u0440\u0430\u0438\u043d\u0430)'), ('213', 'CBS Drama'), ('230', 'CBS Reality'), ('100009', u'CCTV-\u0420\u0443\u0441\u0441\u043a\u0438\u0439'), ('280', 'CNBC'), ('221', 'CNN International'),
		 ('211', 'Cartoon Network'), ('300072', 'Cinema'), ('300126', 'DANGE TV'), ('215', 'DIVA Universal'), ('955', 'Da Vinci'), ('956', 'Daring TV'), ('300036', 'Deutsche Welle'), ('226', 'Discovery'), ('100047', 'Discovery HD'), ('224', 'Discovery Science'), ('223', 'Discovery World'),
		 ('957', u'Discovery \u0423\u043a\u0440\u0430\u0438\u043d\u0430'), ('100055', 'Disney Channel'), ('958', 'English Club TV'), ('1578', u'Enter-\u0444\u0438\u043b\u044c\u043c'), ('208', 'EuroNews'), ('300121', 'Europa Plus TV'), ('206', 'Eurosport'), ('100008', 'Eurosport 2'), ('100048', 'Eurosport HD'),
		 ('259', 'Extreme Sports'), ('100045', 'Fashion TV'), ('300010', 'Fox'), ('300056', 'Fox Life'), ('1356', 'Fox Life HD'), ('300093', 'France 24'), ('1520', 'Galaxy TV'), ('300082', 'Gulli'), ('568', 'HD Life'), ('100037', u'HD \u041a\u0438\u043d\u043e'), ('300123', u'HD \u041a\u0438\u043d\u043e 2'),
		 ('100038', u'HD \u0421\u043f\u043e\u0440\u0442'), ('100042', u'Hustler Blue (\u041d\u043e\u0447\u043d\u043e\u0439 \u043a\u0430\u043d\u0430\u043b)'), ('300059', u'ICTV (\u0423\u043a\u0440\u0430\u0438\u043d\u0430)'), ('100056', 'Investigation Discovery'), ('100049', 'JimJam'), ('300045', 'KidsCo'),
		 ('683', 'Luxe HD'), ('300031', 'Luxe TV'), ('300028', 'MAN TV'), ('1601', 'MAXXI-TV'), ('100030', 'MCM Top'), ('294', 'MGM'), ('1422', 'MGM HD'), ('100029', 'MTV Dance'), ('1558', 'MTV European'), ('1178', 'MTV Hits'), ('1275', 'MTV Live HD'), ('1276', 'MTV Music'), ('1179', 'MTV Rocks'), ('300043', 'MUSIC Box TV'),
		 ('300034', 'Melody Zen TV'), ('229', 'Mezzo'), ('100060', 'Mezzo Live HD'), ('100031', 'Music Box RU'), ('1612', 'Nano TV'), ('100051', 'Nat Geo WILD'), ('300104', 'Nat Geo Wild HD'), ('284', 'National Geographic'), ('300050', 'National Geographic HD'), ('900', 'NewsOne'), ('1603', 'Nick Jr'), ('218', 'Nickelodeon'),
		 ('1391', 'Nickelodeon HD'), ('636', 'Ocean-TV'), ('300118', 'Outdoor Channel'), ('300063', u'PROD\u0435\u043d\u044c\u0433\u0438'), ('1755', 'Paramount Comedy'), ('1157', u'Pro \u0432\u0441\u0435'), ('1449', 'RE:Music'), ('300109', 'RTG TV'), ('300021', 'RTVi'), ('1465', 'RU MUSIC'), ('100046', 'RU.TV'),
		 ('1035', 'Rusong TV'), ('100036', 'Russia Today'), ('300083', 'Russian Travel Guide'), ('689', u'SONY \u0422\u0412'), ('586', 'STV'), ('1503', 'Sony Turbo'), ('300019', 'Style TV'), ('233', 'TCM'), ('100022', 'TLC'), ('300047', 'TV 1000 Action'), ('289', 'TV XXI (TV21)'), ('288', 'TV1000'), ('300116', 'TV1000 Comedy HD'),
		 ('300115', 'TV1000 Megahit HD'), ('300114', 'TV1000 Premium HD'), ('231', 'TV5'), ('665', 'Teen TV'), ('100054', 'Tiji '), ('293', 'Travel'), ('100050', 'Universal Channel'), ('100026', 'VH1 Classic'), ('232', 'VH1 European'), ('324', 'Viasat Explorer'), ('325', 'Viasat History'), ('1009', 'Viasat Nature CEE'),
		 ('300117', 'Viasat Nature/History HD'), ('300002', 'Viasat Sport'), ('100017', u'World Fashion Channel (\u0440\u0443\u0441.)'), ('300032', 'Zee TV'), ('553', u'\u0410\u0432\u0442\u043e \u041f\u043b\u044e\u0441'), ('1505', u'\u0410\u043b\u043c\u0430\u0442\u044b'), ('400005', u'\u0411\u0421\u0422'),
		 ('300074', u'\u0411\u0435\u043b\u041c\u0443\u0437\u0422\u0412 (\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u044c)'), ('300071', u'\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u044c 1'), ('300030', u'\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u044c 2'), ('400007', u'\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u044c 3'),
		 ('300003', u'\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u044c \u0422\u0412'), ('554', u'\u0411\u043e\u0435\u0446'), ('100071', u'\u0411\u043e\u0439\u0446\u043e\u0432\u0441\u043a\u0438\u0439 \u043a\u043b\u0443\u0431'), ('972', u'\u0411\u0440\u044f\u043d\u0441\u043a\u0430\u044f \u0413\u0443\u0431\u0435\u0440\u043d\u0438\u044f'),
		 ('300067', u'\u0412\u041a\u0422'), ('300068', u'\u0412\u041a\u0422 \u0421\u0435\u043c\u044c\u044f'), ('100025', u'\u0412\u0420\u0415\u041c\u042f: \u0434\u0430\u043b\u0435\u043a\u043e\u0435 \u0438 \u0431\u043b\u0438\u0437\u043a\u043e\u0435'),
		 ('300065', u'\u0412\u0422\u0412 (\u041f\u0435\u0440\u0432\u044b\u0439 \u043c\u0443\u0437\u044b\u043a\u0430\u043b\u044c\u043d\u044b\u0439)'),('300080', u'\u0412\u043e\u043b\u0433\u0430'), ('300102', u'\u0412\u043e\u043f\u0440\u043e\u0441\u044b \u0438 \u043e\u0442\u0432\u0435\u0442\u044b'),
		 ('300069', u'\u0412\u043e\u0441\u0442\u043e\u0447\u043d\u044b\u0439 \u044d\u043a\u0441\u043f\u0440\u0435\u0441\u0441'), ('300020', u'\u0414\u0435\u0442\u0441\u043a\u0438\u0439 \u043a\u0430\u043d\u0430\u043b'),('216', u'\u0414\u0435\u0442\u0441\u043a\u0438\u0439 \u043c\u0438\u0440'), 
		 ('1752', u'\u0414\u043e\u0431\u0440\u043e \u0422\u0412 (\u0423\u043a\u0440\u0430\u0438\u043d\u0430)'), ('300066', u'\u0414\u043e\u0432\u0435\u0440\u0438\u0435'), ('300108', u'\u0414\u043e\u0436\u0434\u044c'), ('100002', u'\u0414\u043e\u043c \u043a\u0438\u043d\u043e'),
		 ('300101', u'\u0414\u043e\u043c\u0430\u0448\u043d\u0438\u0435 \u0436\u0438\u0432\u043e\u0442\u043d\u044b\u0435'), ('102', u'\u0414\u043e\u043c\u0430\u0448\u043d\u0438\u0439'), ('528', u'\u0414\u0440\u0430\u0439\u0432 \u0422\u0412'), ('981', u'\u0415\u0414\u0410 HD'), ('708', u'\u0415\u041b \u0430\u0440\u043d\u0430'),
		 ('710', u'\u0415\u0432\u0440\u0430\u0437\u0438\u044f'), ('300076', u'\u0415\u0432\u0440\u043e\u043a\u0438\u043d\u043e'), ('300087', u'\u0415\u043d\u0438\u0441\u0435\u0439 \u0440\u0435\u0433\u0438\u043e\u043d'), ('672', u'\u0416\u0438\u0432\u0438'), ('1078', u'\u0417\u0430\u0433\u043e\u0440\u043e\u0434\u043d\u0430\u044f \u0436\u0438\u0437\u043d\u044c'),
		 ('300041', u'\u0417\u0430\u043a\u043e\u043d \u0422\u0412'), ('330', u'\u0417\u0432\u0435\u0437\u0434\u0430'), ('529', u'\u0417\u0434\u043e\u0440\u043e\u0432\u043e\u0435 \u0422\u0435\u043b\u0435\u0432\u0438\u0434\u0435\u043d\u0438\u0435'), ('300122', u'\u0417\u043d\u0430\u043d\u0438\u0435'), ('663', u'\u0417\u043e\u043e \u0422\u0412'),
		 ('300011', u'\u0417\u043e\u043e\u043f\u0430\u0440\u043a'), ('300023', u'\u0418\u043b\u043b\u044e\u0437\u0438\u043e\u043d +'), ('541', u'\u0418\u043d\u0434\u0438\u044f'), ('300016', u'\u0418\u043d\u0442\u0435\u0440'), ('300017', u'\u0418\u043d\u0442\u0435\u0440+'), ('584', u'\u0418\u043d\u0442\u0435\u0440\u0435\u0441\u043d\u043e\u0435 \u0422\u0412'),
		 ('1639', u'\u0418\u0441\u043a\u0443\u0448\u0435\u043d\u0438\u0435'), ('1613', u'\u041a-\u041f\u043b\u044e\u0441'), ('300077', u'\u041a1'), ('300078', u'\u041a2'), ('100066', u'\u041a\u0418\u041d\u041e\u041b\u042e\u041a\u0421'), ('1392', u'\u041a\u0422\u041a'), ('300086', u'\u041a\u0425\u041b-\u0422\u0412'), ('300039', u'\u041a\u0430\u043d\u0430\u043b 1+1'),
		 ('276', u'\u041a\u0430\u043d\u0430\u043b 2x2'), ('300007', u'\u041a\u0430\u0440\u0443\u0441\u0435\u043b\u044c'), ('100053', u'\u041a\u0438\u043d\u043e \u041f\u041b\u042e\u0421'), ('201', u'\u041a\u0438\u043d\u043e\u043a\u043b\u0443\u0431'), ('300044', u'\u041a\u0438\u043d\u043e\u043c\u0430\u043d\u0438\u044f'), 
		 ('666', u'\u041a\u0438\u043d\u043e\u043f\u043e\u043a\u0430\u0437'), ('300095', u'\u041a\u0438\u043d\u043e\u043f\u043e\u043a\u0430\u0437 HD-1'), ('300096', u'\u041a\u0438\u043d\u043e\u043f\u043e\u043a\u0430\u0437 HD-2'), ('100061', u'\u041a\u0438\u043d\u043e\u0440\u0435\u0439\u0441 1 (\u041d\u0422\u0412)'), 
		 ('100062', u'\u041a\u0438\u043d\u043e\u0440\u0435\u0439\u0441 2 (\u041d\u0422\u0412)'), ('100063', u'\u041a\u0438\u043d\u043e\u0440\u0435\u0439\u0441 3 (\u041d\u0422\u0412)'), ('100064', u'\u041a\u0438\u043d\u043e\u0440\u0435\u0439\u0441 4 (\u041d\u0422\u0412)'), ('100065', u'\u041a\u0438\u043d\u043e\u0440\u0435\u0439\u0441 5 (\u041d\u0422\u0412)'), 
		 ('448', u'\u041a\u0438\u043d\u043e\u0441\u043e\u044e\u0437'), ('298', u'\u041a\u0438\u043d\u043e\u0445\u0438\u0442'), ('100057', u'\u041a\u043e\u043c\u0435\u0434\u0438 \u0422\u0412'), ('291', u'\u041a\u043e\u043c\u0435\u0434\u0438\u044f \u0422\u0412'), 
		 ('100067', u'\u041a\u043e\u043c\u0441\u043e\u043c\u043e\u043b\u044c\u0441\u043a\u0430\u044f \u043f\u0440\u0430\u0432\u0434\u0430'), ('300014', u'\u041a\u0442\u043e \u0435\u0441\u0442\u044c \u043a\u0442\u043e'), ('585', u'\u041a\u0443\u0445\u043d\u044f \u0422\u0412'), ('557', u'\u041b\u044f-\u041c\u0438\u043d\u043e\u0440'), 
		 ('314', u'\u041c-1'), ('100010', u'\u041c\u0418\u0420'), ('400009', u'\u041c\u0418\u0420 24'), ('1900', u'\u041c\u0423\u0417-\u0422\u0412'), ('300015', u'\u041c\u0430\u0442\u044c \u0438 \u0414\u0438\u0442\u044f'), ('974', u'\u041c\u0438\u0440 \u0441\u0435\u0440\u0438\u0430\u043b\u043e\u0432'), ('558', u'\u041c\u043d\u043e\u0433\u043e \u0422\u0412'), 
		 ('106', u'\u041c\u043e\u0441\u043a\u0432\u0430-24'), ('400001', u'\u041c\u043e\u044f \u041f\u043b\u0430\u043d\u0435\u0442\u0430'), ('300110', u'\u041c\u0443\u0436\u0441\u043a\u043e\u0439'), ('100032', u'\u041c\u0443\u0437\u044b\u043a\u0430 \u041f\u0435\u0440\u0432\u043e\u0433\u043e'), 
		 ('300012', u'\u041c\u0443\u043b\u044c\u0442\u0438\u043c\u0430\u043d\u0438\u044f'), ('1646', u'\u041d\u0412\u041a \u0421\u0410\u0425\u0410'), ('1439', u'\u041d\u041b\u041e-\u0422\u0412'), ('334', u'\u041d\u041d\u0422\u0412'), ('4', u'\u041d\u0422\u0412'), ('300053', u'\u041d\u0422\u0412 \u0411\u0435\u043b\u0430\u0440\u0443\u0441\u044c'), 
		 ('300055', u'\u041d\u0422\u0412-\u041c\u0438\u0440'), ('100070', u'\u041d\u0422\u0412-\u041f\u041b\u042e\u0421 3D by PANASONIC'), ('454', u'\u041d\u0422\u0412-\u041f\u041b\u042e\u0421 \u0411\u0430\u0441\u043a\u0435\u0442\u0431\u043e\u043b'), ('504', u'\u041d\u0422\u0412-\u041f\u041b\u042e\u0421 \u041d\u0430\u0448 \u0424\u0443\u0442\u0431\u043e\u043b'), 
		 ('1018', u'\u041d\u0422\u0412-\u041f\u041b\u042e\u0421 \u0421\u043f\u043e\u0440\u0442'), ('100001', u'\u041d\u0422\u0412-\u041f\u041b\u042e\u0421 \u0421\u043f\u043e\u0440\u0442 \u041a\u043b\u0430\u0441\u0441\u0438\u043a\u0430'), ('207', u'\u041d\u0422\u0412-\u041f\u041b\u042e\u0421 \u0421\u043f\u043e\u0440\u0442 \u041e\u043d\u043b\u0430\u0439\u043d'), 
		 ('455', u'\u041d\u0422\u0412-\u041f\u041b\u042e\u0421 \u0422\u0435\u043d\u043d\u0438\u0441'), ('205', u'\u041d\u0422\u0412-\u041f\u041b\u042e\u0421 \u0424\u0443\u0442\u0431\u043e\u043b'), ('300106', u'\u041d\u0422\u0412-\u041f\u041b\u042e\u0421 \u0424\u0443\u0442\u0431\u043e\u043b (HD)'), 
		 ('100069', u'\u041d\u0422\u0412-\u041f\u041b\u042e\u0421 \u0424\u0443\u0442\u0431\u043e\u043b 2 HD'), ('1012', u'\u041d\u0422\u041a (\u041a\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043d)'), ('300062', u'\u041d\u0422\u041d (\u0423\u043a\u0440\u0430\u0438\u043d\u0430)'), 
		 ('300033', u'\u041d\u0430\u0441\u0442\u043e\u044f\u0449\u0435\u0435 \u0421\u0442\u0440\u0430\u0448\u043d\u043e\u0435 \u0422\u0412'), ('300105', u'\u041d\u0430\u0443\u043a\u0430 2.0'), ('447', u'\u041d\u0430\u0448\u0435 \u041d\u043e\u0432\u043e\u0435 \u041a\u0438\u043d\u043e'), ('202', u'\u041d\u0430\u0448\u0435 \u043a\u0438\u043d\u043e'), 
		 ('300073', u'\u041d\u0430\u0448\u0435 \u043a\u0438\u043d\u043e (\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u044c)'), ('315', u'\u041d\u043e\u0432\u044b\u0439 \u041a\u0430\u043d\u0430\u043b'), ('100016', u'\u041d\u043e\u0441\u0442\u0430\u043b\u044c\u0433\u0438\u044f'), ('400006', u'\u041d\u043e\u0447\u043d\u043e\u0439 \u043a\u043b\u0443\u0431'), 
		 ('369', u'\u041e2\u0422\u0412'), ('300029', u'\u041e\u041d\u0422 (\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u044c)'), ('1544', u'\u041e\u0421\u0422'), ('254', u'\u041e\u0422\u0412 - \u041e\u0431\u043b\u0430\u0441\u0442\u043d\u043e\u0435 \u0442\u0435\u043b\u0435\u0432\u0438\u0434\u0435\u043d\u0438\u0435'), ('1000', u'\u041e\u0422\u0420'),
		 ('1071', u'\u041e\u0440\u0443\u0436\u0438\u0435'), ('530', u'\u041e\u0445\u043e\u0442\u0430 \u0438 \u0440\u044b\u0431\u0430\u043b\u043a\u0430'), ('300091', u'\u041e\u0445\u043e\u0442\u043d\u0438\u043a \u0438 \u0440\u044b\u0431\u043e\u043b\u043e\u0432'), ('1534', u'\u041f\u041b\u042e\u0421\u041f\u041b\u042e\u0421'),
		 ('100013', u'\u041f\u0430\u0440\u043a \u0440\u0430\u0437\u0432\u043b\u0435\u0447\u0435\u043d\u0438\u0439'), ('300125', u'\u041f\u0435\u0440\u0432\u044b\u0439 HD'), ('714', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u0410\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c\u043d\u044b\u0439'),
		 ('400002', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u0432\u0441\u0435\u043c\u0438\u0440\u043d\u0430\u044f \u0441\u0435\u0442\u044c. (\u0415\u0432\u0440\u043e\u043f\u0430)'), ('1403', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u0434\u0435\u043b\u043e\u0432\u043e\u0439'), ('1', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u043a\u0430\u043d\u0430\u043b'),
		 ('236', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u043a\u0430\u043d\u0430\u043b (\u041e\u0440\u0431\u0438\u0442\u0430 1 +8)'), ('242', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u043a\u0430\u043d\u0430\u043b (\u041e\u0440\u0431\u0438\u0442\u0430 2 +6)'), 
		 ('243', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u043a\u0430\u043d\u0430\u043b (\u041e\u0440\u0431\u0438\u0442\u0430 3 +4)'), ('244', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u043a\u0430\u043d\u0430\u043b (\u041e\u0440\u0431\u0438\u0442\u0430 4 +2)'), 
		 ('300111', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u043a\u0430\u043d\u0430\u043b. (\u0415\u0432\u0440\u043e\u043f\u0430)'), ('300090', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u043a\u0430\u043d\u0430\u043b. (\u0421\u041d\u0413)'), ('300112', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u043a\u0430\u043d\u0430\u043b. (\u0423\u043a\u0440\u0430\u0438\u043d\u0430)'), 
		 ('300038', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u043d\u0430\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0439 (\u0423\u043a\u0440\u0430\u0438\u043d\u0430)'), ('300119', u'\u041f\u0435\u0440\u0432\u044b\u0439 \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0439'), ('109', u'\u041f\u0435\u0440\u0435\u0446'), 
		 ('1767', u'\u041f\u0438\u043a\u0441\u0435\u043b\u044c'), ('300092', u'\u041f\u043e\u0434\u043c\u043e\u0441\u043a\u043e\u0432\u044c\u0435'), ('203', u'\u041f\u0440\u0435\u043c\u044c\u0435\u0440\u0430'), ('1433', u'\u041f\u0440\u043e\u0441\u0432\u0435\u0449\u0435\u043d\u0438\u0435'), ('300099', u'\u041f\u0441\u0438\u0445\u043e\u043b\u043e\u0433\u0438\u044f21'),
		 ('1671', u'\u041f\u044f\u0442\u043d\u0438\u0446\u0430'), ('255', u'\u041f\u044f\u0442\u044b\u0439 \u041a\u0430\u043d\u0430\u043b'), ('326', u'\u0420\u0411\u041a'), ('103', u'\u0420\u0415\u041d \u0422\u0412'), ('526', u'\u0420\u0415\u041d \u0422\u0412-\u0420\u0415\u041f\u041e\u0420\u0422\u0401\u0420'),
		 ('1093', u'\u0420\u0422\u0412 - \u041b\u044e\u0431\u0438\u043c\u043e\u0435 \u043a\u0438\u043d\u043e'), ('300049', u'\u0420\u0422\u0420 \u0411\u0435\u043b\u0430\u0440\u0443\u0441\u044c'), ('300057', u'\u0420\u0422\u0420 \u041f\u043b\u0430\u043d\u0435\u0442\u0430'), ('595', u'\u0420\u0430\u0434\u043e\u0441\u0442\u044c \u041c\u043e\u044f'),
		 ('300103', u'\u0420\u0430\u0437\u0422\u0412'), ('329', u'\u0420\u0435\u0442\u0440\u043e \u0422\u0412'), ('2', u'\u0420\u043e\u0441\u0441\u0438\u044f 1'), ('237', u'\u0420\u043e\u0441\u0441\u0438\u044f 1 (\u0434\u0443\u0431\u043b\u044c 1)'), ('245', u'\u0420\u043e\u0441\u0441\u0438\u044f 1 (\u0434\u0443\u0431\u043b\u044c 2)'),
		 ('246', u'\u0420\u043e\u0441\u0441\u0438\u044f 1 (\u0434\u0443\u0431\u043b\u044c 3)'), ('247', u'\u0420\u043e\u0441\u0441\u0438\u044f 1 (\u0434\u0443\u0431\u043b\u044c 4)'), ('235', u'\u0420\u043e\u0441\u0441\u0438\u044f 2 (\u0421\u043f\u043e\u0440\u0442)'), ('676', u'\u0420\u043e\u0441\u0441\u0438\u044f 24'),
		 ('300124', u'\u0420\u043e\u0441\u0441\u0438\u044f HD'), ('5', u'\u0420\u043e\u0441\u0441\u0438\u044f \u041a\u0443\u043b\u044c\u0442\u0443\u0440\u0430'), ('555', u'\u0420\u0443\u0441\u0441\u043a\u0430\u044f \u043d\u043e\u0447\u044c'), ('200000', u'\u0420\u0443\u0441\u0441\u043a\u0438\u0439 \u0418\u043b\u043b\u044e\u0437\u0438\u043e\u043d'),
		 ('540', u'\u0420\u0443\u0441\u0441\u043a\u0438\u0439 \u042d\u043a\u0441\u0442\u0440\u0438\u043c'), ('1367', u'\u0420\u0443\u0441\u0441\u043a\u0438\u0439 \u0431\u0435\u0441\u0442\u0441\u0435\u043b\u043b\u0435\u0440'), ('401', u'\u0420\u0443\u0441\u0441\u043a\u0438\u0439 \u0440\u043e\u043c\u0430\u043d'), ('300079', u'\u0421\u0415\u0422\u0418 \u041d\u041d'),
		 ('318', u'\u0421\u0422\u0411'), ('300048', u'\u0421\u0422\u0412'), ('1516', u'\u0421\u0422\u0412 (\u041a\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043d)'), ('269', u'\u0421\u0422\u041e'), ('104', u'\u0421\u0422\u0421'), ('1556', u'\u0421\u0422\u0421 International'), ('1307', u'\u0421\u0430\u043d\u043a\u0442-\u041f\u0435\u0442\u0435\u0440\u0431\u0443\u0440\u0433'),
		 ('300035', u'\u0421\u0430\u0440\u0430\u0444\u0430\u043d \u0422\u0412'), ('1517', u'\u0421\u0435\u0434\u044c\u043c\u043e\u0439 \u043a\u0430\u043d\u0430\u043b (\u041a\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043d)'), ('1854', u'\u0421\u0438\u043d\u0435\u0440\u0433\u0438\u044f \u0422\u0412'),
		 ('100024', u'\u0421\u043e\u0432\u0435\u0440\u0448\u0435\u043d\u043d\u043e \u0421\u0435\u043a\u0440\u0435\u0442\u043d\u043e'), ('300006', u'\u0421\u043e\u044e\u0437'), ('222', u'\u0421\u043f\u0430\u0441 \u0422\u0412'), ('940', u'\u0421\u043f\u043e\u0440\u0442 1'), ('100072', u'\u0421\u043f\u043e\u0440\u0442 1 (HD)'),
		 ('1354', u'\u0421\u043f\u043e\u0440\u0442 2'), ('100052', u'\u0421\u043f\u043e\u0440\u0442 \u041f\u041b\u042e\u0421'), ('1417', u'\u0421\u043f\u043e\u0440\u0442 \u0421\u043e\u044e\u0437'), ('200001', u'\u0421\u0442\u0435\u0440\u0445\u0422\u0412'), ('1574', u'\u0421\u0442\u0438\u043b\u044c \u0438 \u043c\u043e\u0434\u0430'), 
		 ('887', u'\u0421\u0442\u0440\u0430\u043d\u0430'), ('1638', u'\u0422\u0411\u041d'), ('300000', u'\u0422\u0412-1000 \u0420\u0443\u0441\u0441\u043a\u043e\u0435 \u043a\u0438\u043d\u043e'), ('798', u'\u0422\u0412-2'), ('105', u'\u0422\u0412-3'), ('400003', u'\u0422\u0412-\u0426\u0435\u043d\u0442\u0440-\u041c\u0435\u0436\u0434\u0443\u043d\u0430\u0440\u043e\u0434\u043d\u043e\u0435'),
		 ('1167', u'\u0422\u0412i'), ('3', u'\u0422\u0412\u0426'), ('100018', u'\u0422\u0414\u041a'), ('319', u'\u0422\u0415\u0422'), ('300061', u'\u0422\u041a \u041c\u0435\u0433\u0430'), ('101', u'\u0422\u041d\u0422'), ('446', u'\u0422\u041d\u0422 (\u0427\u0435\u043b\u044f\u0431\u0438\u043d\u0441\u043a)'), ('1126', u'\u0422\u041d\u0422-\u0422\u043e\u043c\u0441\u043a'), 
		 ('200002', u'\u0422\u041d\u0422-\u042f\u043a\u0443\u0442\u0441\u043a'), ('1109', u'\u0422\u0420\u041a \u0414\u043e\u043d\u0431\u0430\u0441\u0441'), ('311', u'\u0422\u0420\u041a \u041a\u0438\u0435\u0432'), ('1529', u'\u0422\u0420\u041a \u042e\u043d\u0438\u043e\u043d'), ('727', u'\u0422\u0420\u041e'), 
		 ('563', u'\u0422\u0430\u0442\u0430\u0440\u0441\u0442\u0430\u043d - \u041d\u043e\u0432\u044b\u0439 \u0412\u0435\u043a'), ('867', u'\u0422\u0432\u043e\u0439 \u0422\u0412'), ('620', u'\u0422\u0435\u043b\u0435\u043a\u0430\u0444\u0435'), ('292', u'\u0422\u0435\u043b\u0435\u043a\u043b\u0443\u0431'), 
		 ('662', u'\u0422\u0435\u043b\u0435\u043f\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u044f'), ('300097', u'\u0422\u0435\u043b\u0435\u043f\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u044f HD'), ('320', u'\u0422\u043e\u043d\u0438\u0441'), ('790', u'\u0422\u043e\u043d\u0443\u0441 \u0422\u0412'), 
		 ('300040', u'\u0423\u0422\u0420'), ('321', u'\u0423\u043a\u0440\u0430\u0438\u043d\u0430'), ('300081', u'\u0423\u043b\u044b\u0431\u043a\u0430 \u0440\u0435\u0431\u0435\u043d\u043a\u0430'), ('432', u'\u0423\u0441\u0430\u0434\u044c\u0431\u0430'), ('927', u'\u0423\u0441\u043f\u0435\u0445'), ('300025', u'\u0424\u0435\u043d\u0438\u043a\u0441+\u041a\u0438\u043d\u043e'), 
		 ('686', u'\u0424\u0443\u0442\u0431\u043e\u043b'), ('1436', u'\u0424\u0443\u0442\u0431\u043e\u043b (\u0423\u043a\u0440\u0430\u0438\u043d\u0430)'), ('1552', u'\u0424\u0443\u0442\u0431\u043e\u043b+'), ('707', u'\u0425\u0430\u0431\u0430\u0440'), ('400008', u'\u0425\u043e\u043a\u043a\u0435\u0439'), ('996', u'\u0427\u041f.Info'), 
		 ('1214', u'\u0427\u0435\u0442\u0432\u0435\u0440\u0442\u044b\u0439 \u043a\u0430\u043d\u0430\u043b (\u0415\u043a\u0430\u0442\u0435\u0440\u0438\u043d\u0431\u0443\u0440\u0433)'), ('300054', u'\u0428\u0430\u043d\u0441\u043e\u043d \u0422\u0412'), ('272', u'\u0428\u043a\u043e\u043b\u044c\u043d\u0438\u043a'), ('100059', u'\u042d\u0433\u043e\u0438\u0441\u0442 \u0422\u0412'), 
		 ('108', u'\u042e-\u0422\u0412'), ('475', u'\u042e\u0433\u0440\u0430'), ('300042', u'\u042e\u043c\u043e\u0440 \u0422\u0412')]

class Channel(models.Model):
	name=models.CharField('Название',max_length=100)
	logo=models.ImageField('Логотип',upload_to='logos')
	description=models.TextField('Описание',blank=True)
	torrent_file=models.FileField('Торрент Файл',upload_to='torrents')
	login_required=models.BooleanField()
	vip=models.BooleanField()
	category=models.CharField('Категория',choices=channels_category,max_length=200)
	epg=models.CharField('Программа передач',choices=ch_list,max_length=200)
	def __unicode__(self):
		return self.name





	