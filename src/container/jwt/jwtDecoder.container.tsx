import { Textarea } from '@/components/ui/textarea.tsx';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field.tsx';
import { JsonEditorContainer } from '@/container/json/jsonEditor.container.tsx';
import { ViewTypeConstant } from '@/container/json/constant/viewType.constant.ts';
import { BannerComponent } from '@/components/banner.component.tsx';
import { useEffect, useState } from 'react';
import { JwtService } from '@/container/jwt/service/jwt.service.ts';

const EXAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInJvbGVzIjpbInVzZXIiXSwiaXNzIjoiaHR0cHM6Ly9leGFtcGxlLmNvbSIsImF1ZCI6ImRldnRvb2xzLWFwcCIsImlhdCI6MTc4MzI0NTYwMCwibmJmIjoxNzgzMjQ1NjAwLCJqdGkiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAifQ._DlrqriXaV-q2HbqvhZ4SDnZ2D2HZUFiDlfgHShJrtg';

export const JwtDecoderContainer = () => {
	const [originalJWT, setOriginalJWT] = useState<string>(EXAMPLE_JWT);
	const [header, setHeader] = useState<string>('{}');
	const [payload, setPayload] = useState<string>('{}');
	const [secret, setSecret] = useState<string>('Your secret');
	const [errorMessage, setErrorMessage] = useState<string>();

	useEffect(() => {
		const fn = async () => {
			try {
				setErrorMessage(undefined);
				const parsedJwt = JwtService.parseJwt(originalJWT);

				setHeader(JSON.stringify(parsedJwt.header));
				setPayload(JSON.stringify(parsedJwt.payload));
				await JwtService.verifyJWT(originalJWT, secret);
			} catch (error) {
				console.error('Failed to parse JSON',error);
				setErrorMessage('Failed to parse JSON: ' + (error as Error)?.message);
			}
		};

		fn()
			.catch(console.error);
	}, [secret, originalJWT]);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col lg:grid lg:grid-cols-2 gap-2">
				<Field>
					<FieldLabel htmlFor="encoded_jwt">
						JWT
					</FieldLabel>
					<FieldContent>
						<Textarea
							id="encoded_jwt"
							className="h-full"
							aria-label="Encoded JWT"
							value={originalJWT}
							onChange={(e) => setOriginalJWT(e.target.value)}
						/>
					</FieldContent>
				</Field>
				<div className="grid grid-rows-[repeat(fit-content,minmax(0,1fr))] gap-2">
					<Field className="h-full">
						<FieldLabel>
							Decoded Header
						</FieldLabel>
						<FieldContent className="h-full">
							<JsonEditorContainer
								ariaLabel="Decoded JWT header"
								className="h-full"
								value={header}
								defaultViewType={ViewTypeConstant.TREE}
								readOnly={true}
							/>
						</FieldContent>
					</Field>
					<Field
						className="h-full"
					>
						<FieldLabel>
							Decoded Payload
						</FieldLabel>
						<FieldContent
							className="h-full"
						>
							<JsonEditorContainer
								ariaLabel="Decoded JWT payload"
								className="h-full"
								value={payload}
								defaultViewType={ViewTypeConstant.TREE}
								readOnly={true}
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
								aria-label="JWT verification secret or public key"
								className="h-full"
								onChange={(e) => setSecret(e.target.value)}
								value={secret}
							/>
						</FieldContent>
					</Field>
				</div>
			</div>
			<BannerComponent
				variant={errorMessage ? 'destructive' : 'default'}
				title={errorMessage ? 'Error' : 'Success'}
			>
				{errorMessage ?? 'JWT is valid'}
			</BannerComponent>
		</div>
	);
};
