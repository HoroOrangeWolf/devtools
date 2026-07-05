import { Field, FieldContent, FieldLabel } from '@/components/ui/field.tsx';
import { JsonEditorContainer } from '@/container/json/jsonEditor.container.tsx';
import { ViewTypeConstant } from '@/container/json/constant/viewType.constant.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useEffect, useState } from 'react';
import { JwtService } from '@/container/jwt/service/jwt.service.ts';
import { BannerComponent } from '@/components/banner.component.tsx';
import { SelectWrapper } from '@/components/select/selectWrapper.component.tsx';
import {
	isJwtAlgorithm,
	JWT_ALGORITHM_FIXTURE_BY_ALGORITHM,
	JWT_ALGORITHM_FIXTURES,
	JwtAlgorithm,
} from '@/container/jwt/fixture/jwtAlgorithm.fixture.ts';

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
  "jti": "550e8400-e29b-41d4-a716-446655440000"
}
`;

const HEADER_EXAMPLE = `
{
  "alg": "HS256",
  "typ": "JWT"
}
`;

const DEFAULT_ALGORITHM: JwtAlgorithm = 'HS256';
const ALGORITHM_OPTIONS = JWT_ALGORITHM_FIXTURES.map(({ algorithm }) => ({
	label: algorithm,
	value: algorithm,
}));

const getAlgorithmFromHeader = (header: string): JwtAlgorithm | undefined => {
	try {
		const algorithm = JSON.parse(header).alg;

		return isJwtAlgorithm(algorithm) ? algorithm : undefined;
	} catch {
		return undefined;
	}
};

export const JwtEncoderContainer = () => {
	const [header, setHeader] = useState<string>(HEADER_EXAMPLE);
	const [payload, setPayload] = useState<string>(JWT_PAYLOAD_EXAMPLE);
	const [secret, setSecret] = useState<string>(JWT_ALGORITHM_FIXTURE_BY_ALGORITHM[DEFAULT_ALGORITHM].secret);
	const [result, setResult] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>();
	const selectedAlgorithm = getAlgorithmFromHeader(header);

	const handleAlgorithmChange = (algorithm: JwtAlgorithm) => {
		const parsedHeader = JSON.parse(header);

		setHeader(JSON.stringify({ ...parsedHeader, alg: algorithm }, undefined, 2));
		setSecret(JWT_ALGORITHM_FIXTURE_BY_ALGORITHM[algorithm].secret);
	};

	const handleHeaderChange = (nextHeader: string) => {
		const previousAlgorithm = getAlgorithmFromHeader(header);
		const nextAlgorithm = getAlgorithmFromHeader(nextHeader);

		setHeader(nextHeader);

		if (nextAlgorithm && nextAlgorithm !== previousAlgorithm) {
			setSecret(JWT_ALGORITHM_FIXTURE_BY_ALGORITHM[nextAlgorithm].secret);
		}
	};

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
				<div className="grid grid-rows-[repeat(fit-content,minmax(0,1fr))] gap-2">
					<Field className="h-full">
						<FieldLabel>
							JWT Header
						</FieldLabel>
						<FieldContent className="h-full">
							<JsonEditorContainer
								ariaLabel="JWT header"
								className="h-full"
								value={header}
								onChange={handleHeaderChange}
								defaultViewType={ViewTypeConstant.TREE}
							/>
						</FieldContent>
					</Field>
					<Field>
						<FieldLabel>Algorithm</FieldLabel>
						<FieldContent>
							<SelectWrapper<JwtAlgorithm>
								ariaLabel="JWT signing algorithm"
								options={ALGORITHM_OPTIONS}
								placeholder="Unsupported algorithm"
								value={selectedAlgorithm ?? ''}
								onChange={handleAlgorithmChange}
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
								ariaLabel="JWT payload"
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
						<FieldLabel>Secret / Private Key</FieldLabel>
						<FieldContent
							className="h-full"
						>
							<Textarea
								aria-label="JWT signing secret or private key"
								className="h-full"
								onChange={(e) => setSecret(e.target.value)}
								value={secret}
							/>
						</FieldContent>
					</Field>
				</div>
				<Textarea
					aria-label="Signed JWT"
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
