import React, { useState, forceUpdate } from 'react';
import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
import { Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar, Link, Text } from '@vkontakte/vkui';

const Home = ({ id, go, fetchedUser, val, changeVal }) => (

	<Panel id={id}>
		<PanelHeader>QRабыз</PanelHeader>

		<Group header={<Header mode="secondary">Отсканируйте QR-код</Header>}>
			<Div>
				<Text>Кол-во отсканированных QR-кодов: {
				val.map((answer, i) => {
					if (answer == 'Здесь будут ваши QR-коды') {
						return(0);
					} else if (val.length == i + 1) {
						return(val.length);
					}
				})}</Text>
				<br/>
				<Button stretched size="l" mode="primary" onClick={() => {
					let link = '';
					bridge.subscribe(event => {
						if (!event.detail) {
						  return;
						}
						const { type, data } = event.detail;
						if (type === 'VKWebAppOpenCodeReaderResult') {
							link = val.slice();
							if (link[0] == 'Здесь будут ваши QR-коды') {
								link = [];
							}
							link.push(data.code_data);
							changeVal(link);
						}
						if (type === 'VKWebAppOpenCodeReaderFailed') {
						  // Catching the error
						  console.log(data.error_type, data.error_data);
						}
					});
					bridge.send("VKWebAppOpenCodeReader");
					bridge.unsubscribe();
				}}>Сканировать</Button>
			</Div>
		</Group>

		<Group header={<Header mode="secondary">Ваши QR-коды</Header>}>
				{val.map((answer, i) => {
					if (answer == 'Здесь будут ваши QR-коды') {
						return(<Div>{answer}</Div>);
					} else if (isUrl(answer)) {
						return (<Div><Link href={answer}>Ссылка: {answer}</Link></Div>)
					} else if (isUrl(answer) == false) {
						return (<Div>Текст: {answer}</Div>)
					}
				})}
		</Group>
	</Panel>

);

function isUrl(s) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	return regexp.test(s);
}

Home.propTypes = {
	id: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
	val: PropTypes.array.isRequired,
	changeVal: PropTypes.func.isRequired,
	fetchedUser: PropTypes.shape({
		photo_200: PropTypes.string,
		first_name: PropTypes.string,
		last_name: PropTypes.string,
		city: PropTypes.shape({
			title: PropTypes.string,
		}),
	}),
};

export default Home;
