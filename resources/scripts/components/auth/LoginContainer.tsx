import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import login from '@/api/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';
import Label from '@/components/elements/Label';
import { KeyIcon, UserIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/solid';
import { useTranslation } from 'react-i18next';

interface Values {
    username: string;
    password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
    const { t } = useTranslation('auth');
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');
    const [show, setShow] = useState(false);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });

            return;
        }

        login({ ...values, recaptchaData: token })
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }

                history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
            })
            .catch((error) => {
                console.error(error);

                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', password: '' }}
            validationSchema={object().shape({
                username: string().required(t('username-required')),
                password: string().required(t('password-required')),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer title={t('login-title')} css={tw`w-full flex`}>
                    <Field
                        icon={UserIcon}
                        type={'text'}
                        placeholder={t('username-label')}
                        label={t('username-label')}
                        name={'username'}
                        disabled={isSubmitting}
                    />
                    <div css={tw`mt-3`}>
                        <Label>{t('password-label')}</Label>
                        <div css={tw`relative`}>
                            <Field
                                icon={KeyIcon}
                                type={show ? 'text' : 'password'}
                                placeholder={t('password-label')}
                                name={'password'}
                                disabled={isSubmitting}
                            />
                            <button
                                type={'button'}
                                css={tw`absolute border-l-2 top-[10px] right-[6px] py-2 p-1 border-gray-300 text-gray-300`}
                                onClick={() => setShow(!show)}
                            >
                                {show ? <EyeOffIcon className='h-5 w-5' /> : <EyeIcon className='h-5 w-5' />}
                            </button>
                        </div>
                    </div>
                    <div css={tw`mt-6`}>
                        <Button css={tw`w-full !py-3`} type={'submit'} disabled={isSubmitting}>
                            {t('login-button')}
                        </Button>
                    </div>
                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={(response) => {
                                setToken(response);
                                submitForm();
                            }}
                            onExpire={() => {
                                setSubmitting(false);
                                setToken('');
                            }}
                        />
                    )}
                    <div css={tw`mt-3 text-center`}>
                        <Link
                            to={'/auth/password'}
                            css={tw`text-sm text-reviactyl/80 tracking-wide no-underline hover:text-reviactyl/50`}
                        >
                            {t('forgot-password.label')}
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
