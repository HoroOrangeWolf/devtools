import { Textarea } from '@/components/ui/textarea.tsx';
import { JsonEditorContainer } from '@/container/json/jsonEditor.container.tsx';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field.tsx';
import { ViewTypeConstant } from '@/container/json/constant/viewType.constant.ts';
import { useEffect, useState } from 'react';
import { JwtService } from '@/container/jwt/service/jwt.service.ts';
import { BannerComponent } from '@/components/banner.component.tsx';

export const JwtContainer = () => {
	const [originalJWT, setOriginalJWT] = useState<string>('');
	const [header, setHeader] = useState<string>('{}');
	const [payload, setPayload] = useState<string>('{}');
	const [secret, setSecret] = useState<string>('');
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
			<div className="grid grid-cols-2 gap-2">
				<Textarea
					onChange={(e) => setOriginalJWT(e.target.value)}
				/>
				<div className="grid grid-rows-[repeat(3,minmax(15rem,1fr))] gap-2">
					<Field className="h-full">
						<FieldLabel>
							Decoded Header
						</FieldLabel>
						<FieldContent className="h-full">
							<JsonEditorContainer
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