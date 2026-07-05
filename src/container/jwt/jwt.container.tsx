import { useState } from 'react';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Button } from '@/components/ui/button.tsx';
import { JwtDecoderContainer } from '@/container/jwt/jwtDecoder.container.tsx';
import { JwtEncoderContainer } from '@/container/jwt/jwtEncoder.container.tsx';

export const JwtContainer = () => {
	const [isDecoder, setIsDecoder] = useState<boolean>(true);

	const changeDecoder = () => {
		setIsDecoder((v) => !v);
	};

	return (
		<div className="flex flex-col gap-2">
			<ButtonGroup>
				<Button
					variant={isDecoder ? 'default' : 'outline'}
					onClick={changeDecoder}
				>
					Decoder
				</Button>
				<Button
					variant={isDecoder ? 'outline' : 'default'}
					onClick={changeDecoder}
				>
					Encoder
				</Button>
			</ButtonGroup>
			{isDecoder ? <JwtDecoderContainer /> : <JwtEncoderContainer />}
		</div>
	);
};