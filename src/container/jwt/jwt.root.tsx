import { PageWrapper } from '@/components/pageWrapper.component.tsx';
import { JwtContainer } from '@/container/jwt/jwt.container.tsx';

export const JwtRoot = () => {
	return (
		<PageWrapper>
			<JwtContainer />
		</PageWrapper>
	);
};