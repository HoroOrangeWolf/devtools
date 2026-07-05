import { Field, FieldContent, FieldLabel } from '@/components/ui/field.tsx';
import { JsonEditorContainer } from '@/container/json/jsonEditor.container.tsx';
import { ViewTypeConstant } from '@/container/json/constant/viewType.constant.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useEffect, useState } from 'react';
import { JwtService } from '@/container/jwt/service/jwt.service.ts';
import { BannerComponent } from '@/components/banner.component.tsx';

const JWT_PAYLOAD_EXAMPLE = `
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "roles": ["user"],
  "iss": "https://example.com",
  "aud": "devtools-app",
  "iat": 1783245600,
  "nbf": 1783245600,
  "exp": 1783249200,
  "jti": "550e8400-e29b-41d4-a716-446655440000"
}
`;

const HEADER_EXAMPLE = `
{
  "alg": "HS256",
  "typ": "JWT"
}
`;

export const JwtEncoderContainer = () => {
	const [header, setHeader] = useState<string>(HEADER_EXAMPLE);
	const [payload, setPayload] = useState<string>(JWT_PAYLOAD_EXAMPLE);
	const [secret, setSecret] = useState<string>('Your secret');
	const [result, setResult] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>();

	useEffect(() => {
		const fn = async () => {
			try {
				setErrorMessage(undefined);
				const signedJwt = await JwtService.signJWT(header, payload, secret);
				setResult(signedJwt);
			} catch (error) {
				console.error('Failed to sign key',error);
				setErrorMessage('Failed to sign key : ' + (error as Error)?.message);
			}
		};

		fn()
			.catch(console.error);
	}, [header, payload, secret]);

	return (
		<div className="flex flex-col gap-2">
			<div className="grid grid-cols-2 gap-2">
				<div className="grid grid-rows-[repeat(3,minmax(15rem,1fr))] gap-2">
					<Field className="h-full">
						<FieldLabel>
							JWT Header
						</FieldLabel>
						<FieldContent className="h-full">
							<JsonEditorContainer
								className="h-full"
								value={header}
								onChange={setHeader}
								defaultViewType={ViewTypeConstant.TREE}
							/>
						</FieldContent>
					</Field>
					<Field
						className="h-full"
					>
						<FieldLabel>
							JWT Payload
						</FieldLabel>
						<FieldContent
							className="h-full"
						>
							<JsonEditorContainer
								className="h-full"
								value={payload}
								onChange={setPayload}
								defaultViewType={ViewTypeConstant.TREE}
							/>
						</FieldContent>
					</Field>
					<Field
						className="h-full"
					>
						<FieldLabel>Secret</FieldLabel>
						<FieldContent
							className="h-full"
						>
							<Textarea
								className="h-full"
								onChange={(e) => setSecret(e.target.value)}
								value={secret}
							/>
						</FieldContent>
					</Field>
				</div>
				<Textarea
					value={result}
					className="h-full"
					placeholder="Signed JWT"
					readOnly={true}
				/>
			</div>
			<BannerComponent
				variant={errorMessage ? 'destructive' : 'default'}
				title={errorMessage ? 'Error' : 'Success'}
			>
				{errorMessage ?? 'JWT has been signed'}
			</BannerComponent>
		</div>
	);
};