-- SQLite
delete from metadata;



select count(*) from metadata;



select count(*), ian, name, rarity from metadata 
where advancement = 'COMBO'
group by ian;



select * from metadata 
where advancement = 'COMBO'
group by ian;


select * from metadata;


select * from report;



delete from report;



select * from report where advancement = 'COMBO'


