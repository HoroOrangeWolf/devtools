import { useEffect, useState } from 'react';

export const HydratedMarker = () => {
	const [hydrated, setHydrated] = useState<boolean>(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setHydrated(true);
	}, []);

	return <div data-ishydrated={hydrated} />;
};