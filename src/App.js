import React, { useState, useEffect, forceUpdate } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AdaptivityProvider, AppRoot } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Persik from './panels/Persik';

const App = () => {
	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
	const [val, setVal] = useState(['Здесь будут ваши QR-коды']);

	useEffect(() => {
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		});
		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			setUser(user);
			setPopout(null);
		}
		bridge.subscribe(event => {
			if (!event.detail) {
			  return;
			}
			const { type, data } = event.detail;
			if (type === 'VKWebAppStorageGetResult') {
				let loadData = JSON.parse(data.keys[0].value)
				setVal(loadData);
			}
			if (type === 'VKWebAppStorageGetFailed') {
				console.log(data.error_type, data.error_data);
			}
		});
		bridge.send("VKWebAppStorageGet", {"keys": ["codes"]});
		bridge.unsubscribe();
		fetchData();
	}, []);

	const go = e => {
		setActivePanel(e.currentTarget.dataset.to);
	};

	const changeVal = e => {
		setVal(e);

		bridge.subscribe(event => {
			if (!event.detail) {
			  return;
			}
			const { type, data } = event.detail;
			if (type === 'VKWebAppStorageSetResult') {
				getKeys()
			}
			if (type === 'VKWebAppStorageSetFailed') {
				console.log('ты лох')
			}
		});
		bridge.send("VKWebAppStorageSet", {"key": "codes", "value": JSON.stringify(e)});
		bridge.unsubscribe();

	}

	function getKeys() {
		bridge.subscribe(event => {
			if (!event.detail) {
			  return;
			}
			const { type, data } = event.detail;
			if (type === 'VKWebAppStorageGetResult') {
				// console.log(data);
			}
			if (type === 'VKWebAppStorageGetFailed') {
				console.log(data.error_type, data.error_data);
			}
		});
		bridge.send("VKWebAppStorageGet", {"keys": ["codes"]});
		bridge.unsubscribe();
	}

	return (
		<AdaptivityProvider>
			<AppRoot>
				<View activePanel={activePanel} popout={popout}>
					<Home id='home' fetchedUser={fetchedUser} go={go} val={val} changeVal={changeVal} />
					<Persik id='persik' go={go} />
				</View>
			</AppRoot>
		</AdaptivityProvider>
	);
}

export default App;
