import { useEffect, useState } from 'react';

export const HydratedMarker = () => {
	const [hydrated, setHydrated] = useState<boolean>(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	return <div data-ishydrated={hydrated} />;
};