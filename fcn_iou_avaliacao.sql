drop function if exists fcn_iou_avaliacao;
delimiter //
create function fcn_iou_avaliacao(p_avaliador int, p_avaliado int, p_avaliacao int) returns varchar(200)
begin
	set @a = (select count(*) from tbl_avaliacao where avaliadorId = p_avaliador and avaliadoId = p_avaliado);
	if (@a = 1) then
		update tbl_avaliacao set avaliacao = p_avaliacao, data = current_timestamp where avaliadorId = p_avaliador and avaliadoId = p_avaliado;
		return 'Atualizado';
  else
		insert into tbl_avaliacao (avaliadorId, avaliadoId, avaliacao) values (p_avaliador, p_avaliado, p_avaliacao);
		return 'Criado';
	end if;
end //
delimiter ;

select fcn_iou_avaliacao(1, 2, 3);

-- SELECT * FROM odete_lucas.tbl_avaliacao;