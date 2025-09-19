import jwt from 'jsonwebtoken';
import ms from 'ms';

const generateTokenAndSetCookie = (user, res, rememberMe = false) => {

  const accessTokenExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY || '2h';

  const refreshTokenExpiry = rememberMe
    ? process.env.JWT_REMEMBER_ME_REFRESH_TOKEN_EXPIRY || '30d'
    : process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';


  const accessToken = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: accessTokenExpiry }
  );


  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: refreshTokenExpiry }
  );


  // res.cookie('accessToken', accessToken, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'Strict',
  //   maxAge: ms(accessTokenExpiry), 
  // });

  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'Strict',
  //   maxAge: ms(refreshTokenExpiry), // ms funtion converts time into miliseconds
  // });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,         //  for localhost
    sameSite: 'Lax',       //  fix cookie not updating
    maxAge: ms(accessTokenExpiry),
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: ms(refreshTokenExpiry),
  });






  return { accessToken, refreshToken };
};

export { generateTokenAndSetCookie };
